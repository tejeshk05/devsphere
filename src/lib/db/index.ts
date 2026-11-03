import fs from "fs";
import path from "path";
import initSqlJs, { Database, SqlJsStatic } from "sql.js";

export interface RepositoryRecord {
  id: number;
  owner: string;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  category: string;
  html_url: string;
  created_at: string;
  pushed_at: string | null;
  first_snapshot_at: number;
  last_snapshot_at: number;
  current_stars: number;
  forks_count: number;
  open_issues_count: number;
}

export interface StarSnapshotRecord {
  id?: number;
  repo_id: number;
  stars: number;
  timestamp: number;
  interval_bucket: string;
}

export interface VelocityMetric {
  repo: RepositoryRecord;
  currentStars: number;
  previousStars: number | null;
  starsGained: number | null;
  elapsedHours: number | null;
  starsPerHour: number | null;
  percentageGrowth: number | null;
  status: "active" | "collecting_data";
  firstSnapshotDate: string;
  lastSnapshotDate: string;
}

class DatabaseManager {
  private db: Database | null = null;
  private SQL: SqlJsStatic | null = null;
  private dbPath: string;
  private initPromise: Promise<void> | null = null;

  constructor() {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch {
        // Ignore if directory already exists
      }
    }
    this.dbPath = path.join(dataDir, "devsphere.sqlite");
  }

  public async getDb(): Promise<Database> {
    if (this.db) return this.db;

    if (!this.initPromise) {
      this.initPromise = this.init();
    }
    await this.initPromise;
    return this.db!;
  }

  private async init(): Promise<void> {
    const wasmDir = path.join(process.cwd(), "node_modules", "sql.js", "dist");
    this.SQL = await initSqlJs({
      locateFile: (file) => path.join(wasmDir, file),
    });

    if (fs.existsSync(this.dbPath)) {
      try {
        const fileBuffer = fs.readFileSync(this.dbPath);
        this.db = new this.SQL.Database(fileBuffer);
      } catch (err) {
        console.warn("[DB] Failed to load existing SQLite file, recreating:", err);
        this.db = new this.SQL.Database();
      }
    } else {
      this.db = new this.SQL.Database();
    }

    this.createTables();
    this.save();
  }

  private createTables(): void {
    if (!this.db) return;

    this.db.run(`
      CREATE TABLE IF NOT EXISTS repositories (
        id INTEGER PRIMARY KEY,
        owner TEXT NOT NULL,
        name TEXT NOT NULL,
        full_name TEXT NOT NULL,
        description TEXT,
        language TEXT,
        category TEXT NOT NULL,
        html_url TEXT NOT NULL,
        created_at TEXT NOT NULL,
        pushed_at TEXT,
        first_snapshot_at INTEGER NOT NULL,
        last_snapshot_at INTEGER NOT NULL,
        current_stars INTEGER NOT NULL,
        forks_count INTEGER DEFAULT 0,
        open_issues_count INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS star_snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        repo_id INTEGER NOT NULL,
        stars INTEGER NOT NULL,
        timestamp INTEGER NOT NULL,
        interval_bucket TEXT NOT NULL,
        UNIQUE(repo_id, interval_bucket)
      );

      CREATE INDEX IF NOT EXISTS idx_snapshots_repo_time ON star_snapshots(repo_id, timestamp);

      CREATE TABLE IF NOT EXISTS auth_rate_limits (
        key TEXT PRIMARY KEY,
        attempts INTEGER NOT NULL DEFAULT 0,
        locked_until INTEGER NOT NULL DEFAULT 0,
        last_attempt_at INTEGER NOT NULL
      );
    `);
  }

  public save(): void {
    if (!this.db) return;
    try {
      const data = this.db.export();
      fs.writeFileSync(this.dbPath, Buffer.from(data));
    } catch (err) {
      console.error("[DB] Failed to persist SQLite data to disk:", err);
    }
  }

  /**
   * Upsert a repository record and insert an hourly star snapshot.
   * Returns true if snapshot was inserted, false if interval already had a snapshot.
   */
  public async recordSnapshot(
    repoData: {
      id: number;
      owner: string;
      name: string;
      full_name: string;
      description?: string | null;
      language?: string | null;
      category: string;
      html_url: string;
      created_at: string;
      pushed_at?: string | null;
      stars: number;
      forks?: number;
      open_issues?: number;
    },
    timestamp: number = Date.now()
  ): Promise<boolean> {
    const db = await this.getDb();

    // Create hourly interval bucket (e.g., 2026-11-03-14)
    const date = new Date(timestamp);
    const intervalBucket = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
      date.getUTCDate()
    ).padStart(2, "0")}-${String(date.getUTCHours()).padStart(2, "0")}`;

    // 1. Upsert repository record
    const existingRepo = db.prepare("SELECT first_snapshot_at FROM repositories WHERE id = ?");
    existingRepo.bind([repoData.id]);
    const hasRepo = existingRepo.step();
    const firstSnapshot = hasRepo ? (existingRepo.getAsObject().first_snapshot_at as number) : timestamp;
    existingRepo.free();

    db.run(
      `INSERT OR REPLACE INTO repositories (
        id, owner, name, full_name, description, language, category, html_url,
        created_at, pushed_at, first_snapshot_at, last_snapshot_at, current_stars,
        forks_count, open_issues_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        repoData.id,
        repoData.owner,
        repoData.name,
        repoData.full_name,
        repoData.description || null,
        repoData.language || null,
        repoData.category,
        repoData.html_url,
        repoData.created_at,
        repoData.pushed_at || null,
        firstSnapshot,
        timestamp,
        repoData.stars,
        repoData.forks || 0,
        repoData.open_issues || 0,
      ]
    );

    // 2. Insert snapshot if not already recorded in this interval bucket
    let inserted = false;
    try {
      db.run(
        `INSERT INTO star_snapshots (repo_id, stars, timestamp, interval_bucket)
         VALUES (?, ?, ?, ?)`,
        [repoData.id, repoData.stars, timestamp, intervalBucket]
      );
      inserted = true;
    } catch {
      // UNIQUE constraint violation (duplicate snapshot in interval bucket)
      inserted = false;
    }

    this.save();
    return inserted;
  }

  /**
   * Computes true star growth velocity for a repository over a given hourly window.
   */
  public async getRepoVelocity(
    repoId: number,
    windowHours: number
  ): Promise<VelocityMetric | null> {
    const db = await this.getDb();

    const repoStmt = db.prepare("SELECT * FROM repositories WHERE id = ?");
    repoStmt.bind([repoId]);
    if (!repoStmt.step()) {
      repoStmt.free();
      return null;
    }
    const repo = repoStmt.getAsObject() as unknown as RepositoryRecord;
    repoStmt.free();

    const now = Date.now();
    const targetTimestamp = now - windowHours * 60 * 60 * 1000;

    // Get all snapshots ordered by timestamp ascending
    const snapStmt = db.prepare(
      "SELECT stars, timestamp FROM star_snapshots WHERE repo_id = ? ORDER BY timestamp ASC"
    );
    snapStmt.bind([repoId]);

    const snapshots: { stars: number; timestamp: number }[] = [];
    while (snapStmt.step()) {
      snapshots.push(snapStmt.getAsObject() as { stars: number; timestamp: number });
    }
    snapStmt.free();

    if (snapshots.length === 0) {
      return null;
    }

    const latestSnapshot = snapshots[snapshots.length - 1];

    // Find the snapshot closest to or preceding targetTimestamp
    // We require the historical snapshot to be at least (windowHours * 0.4) hours before latest
    const minElapsedMs = windowHours * 0.4 * 60 * 60 * 1000;
    let baselineSnapshot: { stars: number; timestamp: number } | null = null;

    for (let i = snapshots.length - 1; i >= 0; i--) {
      const s = snapshots[i];
      if (latestSnapshot.timestamp - s.timestamp >= minElapsedMs) {
        baselineSnapshot = s;
        // Keep searching backwards for the one closest to targetTimestamp
        if (s.timestamp <= targetTimestamp) {
          break;
        }
      }
    }

    const firstDate = new Date(repo.first_snapshot_at).toISOString();
    const lastDate = new Date(repo.last_snapshot_at).toISOString();

    if (!baselineSnapshot) {
      // Insufficient historical interval
      return {
        repo,
        currentStars: repo.current_stars,
        previousStars: null,
        starsGained: null,
        elapsedHours: null,
        starsPerHour: null,
        percentageGrowth: null,
        status: "collecting_data",
        firstSnapshotDate: firstDate,
        lastSnapshotDate: lastDate,
      };
    }

    const starsGained = Math.max(0, latestSnapshot.stars - baselineSnapshot.stars);
    const elapsedHours = Math.max(
      0.1,
      (latestSnapshot.timestamp - baselineSnapshot.timestamp) / (1000 * 60 * 60)
    );
    const starsPerHour = parseFloat((starsGained / elapsedHours).toFixed(2));
    const percentageGrowth =
      baselineSnapshot.stars > 0
        ? parseFloat(((starsGained / baselineSnapshot.stars) * 100).toFixed(2))
        : 0;

    return {
      repo,
      currentStars: repo.current_stars,
      previousStars: baselineSnapshot.stars,
      starsGained,
      elapsedHours: parseFloat(elapsedHours.toFixed(1)),
      starsPerHour,
      percentageGrowth,
      status: "active",
      firstSnapshotDate: firstDate,
      lastSnapshotDate: lastDate,
    };
  }

  /**
   * Returns list of repositories ranked by the selected mode and window.
   */
  public async getRankedRepositories(
    category: string,
    mode: "fastest-growing" | "new-releases" | "popular" | "rising-ai",
    windowHours: number = 24,
    limit: number = 50
  ): Promise<VelocityMetric[]> {
    const db = await this.getDb();

    let query = "SELECT id FROM repositories";
    const params: (string | number | null)[] = [];

    if (category !== "ai" && category !== "all") {
      query += " WHERE category = ?";
      params.push(category);
    }

    const stmt = db.prepare(query);
    stmt.bind(params);
    const repoIds: number[] = [];
    while (stmt.step()) {
      repoIds.push((stmt.getAsObject() as { id: number }).id);
    }
    stmt.free();

    const metrics: VelocityMetric[] = [];
    for (const id of repoIds) {
      const metric = await this.getRepoVelocity(id, windowHours);
      if (metric) {
        metrics.push(metric);
      }
    }

    // Rank according to selected mode
    metrics.sort((a, b) => {
      if (mode === "fastest-growing") {
        const velA = a.starsPerHour ?? -1;
        const velB = b.starsPerHour ?? -1;
        if (velB !== velA) return velB - velA;
        return (b.starsGained ?? 0) - (a.starsGained ?? 0);
      }

      if (mode === "new-releases") {
        return new Date(b.repo.created_at).getTime() - new Date(a.repo.created_at).getTime();
      }

      if (mode === "rising-ai") {
        // High percentage growth combined with velocity
        const pctA = a.percentageGrowth ?? -1;
        const pctB = b.percentageGrowth ?? -1;
        if (pctB !== pctA) return pctB - pctA;
        return (b.starsGained ?? 0) - (a.starsGained ?? 0);
      }

      // Default: popular (lifetime stars)
      return b.currentStars - a.currentStars;
    });

    return metrics.slice(0, limit);
  }

  /**
   * Database-backed rate limiting for failed authentication attempts.
   * Shared-store ready for multi-instance deployments.
   */
  public async checkAuthRateLimit(
    key: string,
    maxAttempts: number = 5,
    lockoutMs: number = 15 * 60 * 1000
  ): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }> {
    const db = await this.getDb();
    const now = Date.now();

    const stmt = db.prepare("SELECT * FROM auth_rate_limits WHERE key = ?");
    stmt.bind([key]);
    let record: { attempts: number; locked_until: number; last_attempt_at: number } | null = null;
    if (stmt.step()) {
      record = stmt.getAsObject() as unknown as {
        attempts: number;
        locked_until: number;
        last_attempt_at: number;
      };
    }
    stmt.free();

    if (record) {
      // Check if locked out
      if (record.locked_until > now) {
        const retryAfter = Math.ceil((record.locked_until - now) / 1000);
        return { allowed: false, remaining: 0, retryAfterSeconds: retryAfter };
      }

      // If lockout expired or 30 minutes passed without attempt, reset
      if (now - record.last_attempt_at > 30 * 60 * 1000) {
        db.run(
          "UPDATE auth_rate_limits SET attempts = 0, locked_until = 0, last_attempt_at = ? WHERE key = ?",
          [now, key]
        );
        this.save();
        return { allowed: true, remaining: maxAttempts, retryAfterSeconds: 0 };
      }
    }

    const currentAttempts = record ? record.attempts : 0;
    return {
      allowed: true,
      remaining: Math.max(0, maxAttempts - currentAttempts),
      retryAfterSeconds: 0,
    };
  }

  public async recordAuthFailure(
    key: string,
    maxAttempts: number = 5,
    lockoutMs: number = 15 * 60 * 1000
  ): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }> {
    const db = await this.getDb();
    const now = Date.now();

    const stmt = db.prepare("SELECT attempts FROM auth_rate_limits WHERE key = ?");
    stmt.bind([key]);
    const hasRow = stmt.step();
    const attempts = (hasRow ? (stmt.getAsObject().attempts as number) : 0) + 1;
    stmt.free();

    const lockedUntil = attempts >= maxAttempts ? now + lockoutMs : 0;

    db.run(
      `INSERT OR REPLACE INTO auth_rate_limits (key, attempts, locked_until, last_attempt_at)
       VALUES (?, ?, ?, ?)`,
      [key, attempts, lockedUntil, now]
    );
    this.save();

    const allowed = attempts < maxAttempts;
    const remaining = Math.max(0, maxAttempts - attempts);
    const retryAfterSeconds = lockedUntil > 0 ? Math.ceil(lockoutMs / 1000) : 0;

    return { allowed, remaining, retryAfterSeconds };
  }

  public async clearAuthFailure(key: string): Promise<void> {
    const db = await this.getDb();
    db.run("DELETE FROM auth_rate_limits WHERE key = ?", [key]);
    this.save();
  }
}

// Singleton database instance
export const dbManager = new DatabaseManager();
