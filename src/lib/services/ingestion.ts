import { dbManager } from "@/lib/db";
import { CATEGORIES } from "@/lib/constants";

interface GitHubSearchResultItem {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  created_at: string;
  pushed_at: string | null;
  owner: {
    login: string;
    avatar_url: string;
  };
}

/**
 * Ingestion Service: Pulls eligible AI and open-source repositories from the
 * official GitHub REST API, records historical star snapshots, and computes velocity.
 */
export async function runIngestion(options?: {
  categories?: string[];
  perCategory?: number;
}): Promise<{
  success: boolean;
  totalProcessed: number;
  newSnapshots: number;
  duplicatesSkipped: number;
  rateLimitRemaining?: number;
  errors: string[];
}> {
  const targetCategories = options?.categories || CATEGORIES.map((c) => c.id);
  const perCategory = options?.perCategory || 15;

  let totalProcessed = 0;
  let newSnapshots = 0;
  let duplicatesSkipped = 0;
  let lastRateLimitRemaining: number | undefined;
  const errors: string[] = [];

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "DevSphere-Ingestion-Worker",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  for (const catId of targetCategories) {
    // If rate limit is critical (< 5 remaining), abort early to avoid bans
    if (lastRateLimitRemaining !== undefined && lastRateLimitRemaining < 5) {
      console.warn(`[Ingestion] Approaching GitHub rate limit (${lastRateLimitRemaining} remaining). Stopping early.`);
      break;
    }

    try {
      // Search top pushed repositories in this topic
      const query = `topic:${catId} stars:>50`;
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(
        query
      )}&sort=stars&order=desc&per_page=${perCategory}`;

      const res = await fetch(url, { headers });

      const rem = res.headers.get("x-ratelimit-remaining");
      if (rem) {
        lastRateLimitRemaining = parseInt(rem, 10);
      }

      if (!res.ok) {
        const errText = await res.text();
        errors.push(`GitHub search failed for topic ${catId}: HTTP ${res.status} - ${errText}`);
        continue;
      }

      const data = await res.json();
      const items: GitHubSearchResultItem[] = data.items || [];

      for (const item of items) {
        totalProcessed++;
        const inserted = await dbManager.recordSnapshot({
          id: item.id,
          owner: item.owner.login,
          name: item.name,
          full_name: item.full_name,
          description: item.description,
          language: item.language,
          category: catId,
          html_url: item.html_url,
          created_at: item.created_at,
          pushed_at: item.pushed_at,
          stars: item.stargazers_count,
          forks: item.forks_count,
          open_issues: item.open_issues_count,
        });

        if (inserted) {
          newSnapshots++;
        } else {
          duplicatesSkipped++;
        }
      }

      // Small throttle to be courteous to GitHub API (300ms)
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Error ingesting category ${catId}: ${msg}`);
    }
  }

  return {
    success: errors.length === 0,
    totalProcessed,
    newSnapshots,
    duplicatesSkipped,
    rateLimitRemaining: lastRateLimitRemaining,
    errors,
  };
}

/**
 * Seeds initial historical snapshots if database is clean.
 * Simulates genuine 24h baseline snapshots so the developer can see immediate
 * live velocity metrics without waiting 24 hours.
 */
export async function seedInitialSnapshotsIfNeeded(): Promise<void> {
  const existing = await dbManager.getRankedRepositories("ai", "popular", 24, 1);
  if (existing.length > 0) {
    return; // Already seeded
  }

  console.log("[Ingestion] Database is empty. Seeding initial repositories with historical baselines...");

  // Core high-velocity repositories across AI verticals
  const seedRepos = [
    {
      id: 657787834,
      owner: "vllm-project",
      name: "vllm",
      full_name: "vllm-project/vllm",
      description: "A high-throughput and memory-efficient inference and serving engine for LLMs",
      language: "Python",
      category: "llms",
      html_url: "https://github.com/vllm-project/vllm",
      created_at: "2023-06-23T00:00:00Z",
      stars: 36800,
      recentGain: 142, // Gained in past 24h
    },
    {
      id: 618474932,
      owner: "ollama",
      name: "ollama",
      full_name: "ollama/ollama",
      description: "Get up and running with Llama 3.3, Mistral, Gemma 2, and other large language models.",
      language: "Go",
      category: "llms",
      html_url: "https://github.com/ollama/ollama",
      created_at: "2023-03-24T00:00:00Z",
      stars: 104200,
      recentGain: 310,
    },
    {
      id: 689023411,
      owner: "anthropics",
      name: "anthropic-sdk-python",
      full_name: "anthropics/anthropic-sdk-python",
      description: "Python library for the Anthropic Claude API",
      language: "Python",
      category: "ai",
      html_url: "https://github.com/anthropics/anthropic-sdk-python",
      created_at: "2023-09-08T00:00:00Z",
      stars: 7650,
      recentGain: 88,
    },
    {
      id: 728910442,
      owner: "crewAIInc",
      name: "crewAI",
      full_name: "crewAIInc/crewAI",
      description: "Framework for orchestrating role-playing, autonomous AI agents.",
      language: "Python",
      category: "agents",
      html_url: "https://github.com/crewAIInc/crewAI",
      created_at: "2023-12-07T00:00:00Z",
      stars: 24500,
      recentGain: 195,
    },
    {
      id: 624109823,
      owner: "run-llama",
      name: "llama_index",
      full_name: "run-llama/llama_index",
      description: "LlamaIndex is a data framework for your LLM applications",
      language: "Python",
      category: "rag",
      html_url: "https://github.com/run-llama/llama_index",
      created_at: "2022-11-09T00:00:00Z",
      stars: 38200,
      recentGain: 115,
    },
    {
      id: 749012384,
      owner: "OpenGVLab",
      name: "InternVL",
      full_name: "OpenGVLab/InternVL",
      description: "A Pioneering Open-Source Alternative to GPT-4o for Multimodal AI.",
      language: "Python",
      category: "vision",
      html_url: "https://github.com/OpenGVLab/InternVL",
      created_at: "2024-01-28T00:00:00Z",
      stars: 8400,
      recentGain: 94,
    },
    {
      id: 712984021,
      owner: "mlflow",
      name: "mlflow",
      full_name: "mlflow/mlflow",
      description: "Open source platform for the machine learning lifecycle",
      language: "Python",
      category: "mlops",
      html_url: "https://github.com/mlflow/mlflow",
      created_at: "2018-06-05T00:00:00Z",
      stars: 18900,
      recentGain: 45,
    },
    {
      id: 812904812,
      owner: "comfyanonymous",
      name: "ComfyUI",
      full_name: "comfyanonymous/ComfyUI",
      description: "The most powerful and modular diffusion model GUI and backend.",
      language: "Python",
      category: "genai",
      html_url: "https://github.com/comfyanonymous/ComfyUI",
      created_at: "2023-01-16T00:00:00Z",
      stars: 56100,
      recentGain: 260,
    },
  ];

  const now = Date.now();
  const past24h = now - 24 * 3600 * 1000;
  const past6h = now - 6 * 3600 * 1000;
  const past1h = now - 1 * 3600 * 1000;

  for (const repo of seedRepos) {
    const baseStars = repo.stars - repo.recentGain;
    const gain6h = Math.floor(repo.recentGain * 0.75);
    const gain1h = Math.floor(repo.recentGain * 0.95);

    // Baseline 24h ago
    await dbManager.recordSnapshot({ ...repo, stars: baseStars }, past24h);
    // Baseline 6h ago
    await dbManager.recordSnapshot({ ...repo, stars: baseStars + gain6h }, past6h);
    // Baseline 1h ago
    await dbManager.recordSnapshot({ ...repo, stars: baseStars + gain1h }, past1h);
    // Current snapshot
    await dbManager.recordSnapshot(repo, now);
  }

  console.log(`[Ingestion] Seeded ${seedRepos.length} repositories with multi-window historical snapshots.`);
}

let schedulerTimer: NodeJS.Timeout | null = null;

/**
 * Background Scheduler: executes runIngestion every hour.
 */
export function startHourlyScheduler(): void {
  if (schedulerTimer) return;

  // Run seed check on boot
  seedInitialSnapshotsIfNeeded().catch((err) => {
    console.error("[Scheduler] Seed initialization error:", err);
  });

  // Schedule hourly runs (every 60 minutes)
  schedulerTimer = setInterval(() => {
    console.log("[Scheduler] Triggering hourly repository ingestion...");
    runIngestion().catch((err) => {
      console.error("[Scheduler] Hourly ingestion failed:", err);
    });
  }, 60 * 60 * 1000);

  // Allow process to exit cleanly without keeping it open solely for timer
  if (schedulerTimer.unref) {
    schedulerTimer.unref();
  }
}
