import { CATEGORIES, TIME_FILTERS, TRENDING_MODES, TimeFilterConfig, TrendingModeConfig } from "@/lib/constants";
import { CategoryId, GitHubRepo, TimeFilter, TrendingMode } from "@/types/github";
import { getDateThreshold } from "@/lib/utils";
import { dbManager, VelocityMetric } from "@/lib/db";

interface CacheEntry {
  timestamp: number;
  data: GitHubRepo[];
  rankingMethodology: string;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const CATEGORY_SEARCH_QUALIFIERS: Record<string, string> = {
  ai: "topic:ai",
  "machine-learning": "topic:machine-learning",
  "generative-ai": "topic:generative-ai",
  llms: "topic:llm",
  "ai-agents": "topic:ai-agents",
  rag: "topic:rag",
  "computer-vision": "topic:computer-vision",
  mlops: "topic:mlops",
};

/**
 * Resolves window hours from TimeFilter
 */
export function getWindowHours(timeframe: TimeFilter): number {
  const cfg = TIME_FILTERS.find((t) => t.id === timeframe);
  if (cfg) return cfg.hours;
  if (timeframe === "1h") return 1;
  if (timeframe === "6h") return 6;
  if (timeframe === "24h" || timeframe === "daily") return 24;
  if (timeframe === "7d" || timeframe === "weekly") return 168;
  if (timeframe === "monthly") return 720;
  return 24;
}

/**
 * Normalizes a database VelocityMetric into a standard frontend GitHubRepo
 */
function metricToGitHubRepo(m: VelocityMetric): GitHubRepo {
  return {
    id: m.repo.id,
    name: m.repo.name,
    full_name: m.repo.full_name,
    private: false,
    owner: {
      login: m.repo.owner,
      id: m.repo.id,
      avatar_url: `https://avatars.githubusercontent.com/u/${m.repo.id % 100000}?v=4`,
      html_url: `https://github.com/${m.repo.owner}`,
    },
    html_url: m.repo.html_url,
    description: m.repo.description,
    fork: false,
    url: `https://api.github.com/repos/${m.repo.full_name}`,
    created_at: m.repo.created_at,
    updated_at: new Date(m.repo.last_snapshot_at).toISOString(),
    pushed_at: m.repo.pushed_at || new Date(m.repo.last_snapshot_at).toISOString(),
    homepage: null,
    size: 1024,
    stargazers_count: m.currentStars,
    watchers_count: m.currentStars,
    language: m.repo.language,
    forks_count: m.repo.forks_count,
    open_issues_count: m.repo.open_issues_count,
    topics: [m.repo.category],
    default_branch: "main",
    velocity: {
      starsGained: m.starsGained,
      elapsedHours: m.elapsedHours,
      starsPerHour: m.starsPerHour,
      percentageGrowth: m.percentageGrowth,
      previousStars: m.previousStars,
      firstSnapshotDate: m.firstSnapshotDate,
      lastSnapshotDate: m.lastSnapshotDate,
      status: m.status,
    },
  };
}

export async function fetchTrendingRepos(
  category: CategoryId | string = "ai",
  timeframe: TimeFilter = "24h",
  queryText?: string,
  mode: TrendingMode | string = "fastest-growing",
  page: number = 1
): Promise<{
  repos: GitHubRepo[];
  rateLimitRemaining?: number;
  cached: boolean;
  rankingMethodology: string;
}> {
  // Normalize legacy mode parameters
  let normalizedMode: TrendingMode = "fastest-growing";
  if (mode === "new-releases") normalizedMode = "new-releases";
  else if (mode === "popular" || mode === "all-time") normalizedMode = "popular";
  else if (mode === "rising-ai") normalizedMode = "rising-ai";
  else normalizedMode = "fastest-growing";

  const windowHours = getWindowHours(timeframe);
  const timeConfig = TIME_FILTERS.find((t) => t.id === timeframe) || TIME_FILTERS[2];
  const modeConfig = TRENDING_MODES.find((m) => m.id === normalizedMode) || TRENDING_MODES[0];

  const safePage = Math.max(1, Math.min(page, 10));
  const cacheKey = `${category}:${timeframe}:${normalizedMode}:${safePage}:${queryText || ""}`;
  const now = Date.now();

  const cached = cache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return {
      repos: cached.data,
      cached: true,
      rankingMethodology: cached.rankingMethodology,
    };
  }

  // 1. Check if database has tracked snapshots for this mode
  try {
    const dbMetrics = await dbManager.getRankedRepositories(
      category,
      normalizedMode,
      windowHours,
      50
    );

    if (dbMetrics.length > 0 && (!queryText || !queryText.trim())) {
      const repos = dbMetrics.map(metricToGitHubRepo);
      const rankingMethodology = `${modeConfig.label} (${timeConfig.label}): ${modeConfig.rankingExplanation}`;

      cache.set(cacheKey, {
        timestamp: now,
        data: repos,
        rankingMethodology,
      });

      return {
        repos,
        cached: false,
        rankingMethodology,
      };
    }
  } catch (err) {
    console.warn("[GitHub Service] Error querying database velocity snapshots:", err);
  }

  // 2. Fallback / Live GitHub Search Query Builder
  const dateThreshold = getDateThreshold(Math.max(1, Math.ceil(windowHours / 24)));
  const baseQualifier = CATEGORY_SEARCH_QUALIFIERS[category] || "topic:ai";

  let searchQuery = "";
  if (normalizedMode === "new-releases") {
    searchQuery = `${baseQualifier} created:>${dateThreshold}`;
  } else {
    searchQuery = `${baseQualifier} pushed:>${dateThreshold}`;
  }

  if (queryText && queryText.trim()) {
    searchQuery = `${queryText.trim()} ${searchQuery}`;
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "DevSphere-Discovery-Dashboard",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(
    searchQuery
  )}&sort=stars&order=desc&per_page=30&page=${safePage}`;

  const response = await fetch(searchUrl, {
    headers,
    next: { revalidate: 300 },
  });

  const rateLimitRemaining = response.headers.get("x-ratelimit-remaining")
    ? parseInt(response.headers.get("x-ratelimit-remaining")!, 10)
    : undefined;

  if (!response.ok) {
    if (cached) {
      return {
        repos: cached.data,
        rateLimitRemaining,
        cached: true,
        rankingMethodology: cached.rankingMethodology,
      };
    }
    throw new Error(`GitHub API returned HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  const rawRepos: GitHubRepo[] = data.items || [];

  // Record snapshots in background for discovered repos and attach velocity
  const enrichedRepos: GitHubRepo[] = [];
  for (const r of rawRepos) {
    // Record current snapshot
    await dbManager
      .recordSnapshot({
        id: r.id,
        owner: r.owner.login,
        name: r.name,
        full_name: r.full_name,
        description: r.description,
        language: r.language,
        category: category,
        html_url: r.html_url,
        created_at: r.created_at,
        pushed_at: r.pushed_at,
        stars: r.stargazers_count,
        forks: r.forks_count,
        open_issues: r.open_issues_count,
      })
      .catch(() => {});

    const velocityMetric = await dbManager.getRepoVelocity(r.id, windowHours).catch(() => null);

    enrichedRepos.push({
      ...r,
      velocity: velocityMetric
        ? {
            starsGained: velocityMetric.starsGained,
            elapsedHours: velocityMetric.elapsedHours,
            starsPerHour: velocityMetric.starsPerHour,
            percentageGrowth: velocityMetric.percentageGrowth,
            previousStars: velocityMetric.previousStars,
            firstSnapshotDate: velocityMetric.firstSnapshotDate,
            lastSnapshotDate: velocityMetric.lastSnapshotDate,
            status: velocityMetric.status,
          }
        : {
            starsGained: null,
            elapsedHours: null,
            starsPerHour: null,
            percentageGrowth: null,
            previousStars: null,
            firstSnapshotDate: new Date().toISOString(),
            lastSnapshotDate: new Date().toISOString(),
            status: "collecting_data",
          },
    });
  }

  const rankingMethodology = `${modeConfig.label} (${timeConfig.label}): ${modeConfig.rankingExplanation}`;

  cache.set(cacheKey, {
    timestamp: now,
    data: enrichedRepos,
    rankingMethodology,
  });

  return {
    repos: enrichedRepos,
    rateLimitRemaining,
    cached: false,
    rankingMethodology,
  };
}

export async function fetchRepoDetails(
  owner: string,
  name: string
): Promise<{ repo: GitHubRepo; readme: string | null }> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "DevSphere-Discovery-Dashboard",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
    headers,
    next: { revalidate: 600 },
  });

  if (!repoRes.ok) {
    throw new Error(`Failed to fetch repo ${owner}/${name}: HTTP ${repoRes.status}`);
  }

  const repo: GitHubRepo = await repoRes.json();

  let readme: string | null = null;
  try {
    const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${name}/readme`, {
      headers: {
        ...headers,
        Accept: "application/vnd.github.raw+json",
      },
      next: { revalidate: 600 },
    });

    if (readmeRes.ok) {
      readme = await readmeRes.text();
    }
  } catch (err) {
    console.warn(`Could not fetch README for ${owner}/${name}:`, err);
  }

  return { repo, readme };
}
