export interface GitHubOwner {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  owner: GitHubOwner;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  topics: string[];
  default_branch: string;
  score?: number;
}

export interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepo[];
}

export type TimeFilter = "daily" | "weekly" | "monthly";

export type CategoryId =
  | "ai"
  | "machine-learning"
  | "generative-ai"
  | "llms"
  | "ai-agents"
  | "rag"
  | "computer-vision"
  | "mlops";

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  description: string;
  iconName: string;
  topics: string[];
  searchKeywords: string[];
  accentColor: string;
}

