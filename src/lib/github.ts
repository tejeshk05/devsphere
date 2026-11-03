import { CATEGORIES, TIME_FILTERS } from "@/lib/constants";
import { CategoryId, GitHubRepo, GitHubSearchResponse, TimeFilter } from "@/types/github";
import { getDateThreshold } from "@/lib/utils";

// In-memory cache to safeguard against unauthenticated GitHub API rate limits
interface CacheEntry {
  timestamp: number;
  data: GitHubRepo[];
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
  queryText?: string
): Promise<{ repos: GitHubRepo[]; rateLimitRemaining?: number; cached: boolean }> {
  const cacheKey = `${category}:${timeframe}:${queryText || ""}`;
  const now = Date.now();

  const cached = cache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return { repos: cached.data, cached: true };
  }

  const timeConfig = TIME_FILTERS.find((t) => t.id === timeframe) || TIME_FILTERS[0];
  const dateThreshold = getDateThreshold(timeConfig.days);

  const baseQualifier = CATEGORY_SEARCH_QUALIFIERS[category] || "topic:ai";

  // Construct valid GitHub search query without nested parentheses
  let searchQuery = `${baseQualifier} pushed:>${dateThreshold}`;

  if (queryText && queryText.trim()) {
    searchQuery = `${queryText.trim()} ${baseQualifier}`;
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
  )}&sort=stars&order=desc&per_page=30`;

  const response = await fetch(searchUrl, {
    headers,
    next: { revalidate: 300 },
  });

  const rateLimitRemaining = response.headers.get("x-ratelimit-remaining")
    ? parseInt(response.headers.get("x-ratelimit-remaining")!, 10)
    : undefined;

  if (!response.ok) {
    // If rate limited or error, fall back to cached data if present
    if (cached) {
      return { repos: cached.data, rateLimitRemaining, cached: true };
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
      `GitHub API (${response.status}): ${parsedMessage}. Add a free GITHUB_TOKEN in .env.local to enjoy 5,000 requests/hour.`
    );
  }

  const data: GitHubSearchResponse = await response.json();
  const repos = data.items || [];

  cache.set(cacheKey, { timestamp: now, data: repos });

  return { repos, rateLimitRemaining, cached: false };
}
