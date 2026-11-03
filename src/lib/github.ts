import { CATEGORIES, TIME_FILTERS } from "@/lib/constants";
import { CategoryId, GitHubRepo, GitHubSearchResponse, TimeFilter } from "@/types/github";
import { getDateThreshold } from "@/lib/utils";

interface CacheEntry {
  timestamp: number;
  data: GitHubRepo[];
  rankingMethodology: string;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const CATEGORY_SEARCH_QUALIFIERS: Record<CategoryId, string> = {
  ai: "topic:ai",
  "machine-learning": "topic:machine-learning",
  "generative-ai": "topic:generative-ai",
  llms: "topic:llm",
  "ai-agents": "topic:ai-agents",
  rag: "topic:rag",
  "computer-vision": "topic:computer-vision",
  mlops: "topic:mlops",
};

export async function fetchTrendingRepos(
  category: CategoryId = "ai",
  timeframe: TimeFilter = "daily",
  queryText?: string,
  mode: "velocity" | "all-time" = "velocity",
  page: number = 1
): Promise<{
  repos: GitHubRepo[];
  rateLimitRemaining?: number;
  cached: boolean;
  rankingMethodology: string;
}> {
  const safePage = Math.max(1, Math.min(page, 10));
  const cacheKey = `${category}:${timeframe}:${mode}:${safePage}:${queryText || ""}`;
  const now = Date.now();

  const cached = cache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return {
      repos: cached.data,
      cached: true,
      rankingMethodology: cached.rankingMethodology,
    };
  }

  const timeConfig = TIME_FILTERS.find((t) => t.id === timeframe) || TIME_FILTERS[0];
  const dateThreshold = getDateThreshold(timeConfig.days);
  const baseQualifier = CATEGORY_SEARCH_QUALIFIERS[category] || "topic:ai";

  let searchQuery = "";
  let rankingMethodology = "";

  if (mode === "velocity") {
    // Breakout Velocity Feed: Repositories created within the timeframe
    // Sorted by stars to surface viral new projects rather than legacy frameworks
    searchQuery = `${baseQualifier} created:>${dateThreshold}`;
    rankingMethodology = `Breakout Velocity: Repositories created within the ${timeConfig.period} sorted by star adoption.`;
  } else {
    // Active Ecosystem: Established repositories actively pushed to within the timeframe
    searchQuery = `${baseQualifier} pushed:>${dateThreshold}`;
    rankingMethodology = `Active Heavyweights: Repositories updated within the ${timeConfig.period} sorted by cumulative stars.`;
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
    // If rate limited, fall back to cached data if available
    if (cached) {
      return {
        repos: cached.data,
        rateLimitRemaining,
        cached: true,
        rankingMethodology: cached.rankingMethodology,
      };
    }

    const errorBody = await response.text();
    let parsedMessage = errorBody;
    try {
      const errJson = JSON.parse(errorBody);
      parsedMessage = errJson.message || errorBody;
    } catch {
      // ignore
    }

    throw new Error(
      `GitHub API (${response.status}): ${parsedMessage}. Configure GITHUB_TOKEN in .env.local to enjoy 5,000 requests/hour.`
    );
  }

  const data: GitHubSearchResponse = await response.json();
  let repos = data.items || [];

  // Fallback: If "velocity" mode on daily finds fewer than 5 brand new repos in niche tags,
  // gracefully blend with recent push velocity so user never sees a blank screen
  if (mode === "velocity" && repos.length < 5 && safePage === 1) {
    const fallbackUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(
      `${baseQualifier} pushed:>${dateThreshold}`
    )}&sort=stars&order=desc&per_page=30&page=1`;

    try {
      const fallbackRes = await fetch(fallbackUrl, { headers });
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        repos = fallbackData.items || [];
        rankingMethodology = `Active Pulse (Pushed within ${timeConfig.period}) sorted by star velocity.`;
      }
    } catch {
      // ignore fallback error
    }
  }

  cache.set(cacheKey, {
    timestamp: now,
    data: repos,
    rankingMethodology,
  });

  return { repos, rateLimitRemaining, cached: false, rankingMethodology };
}
