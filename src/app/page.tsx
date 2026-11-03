"use client";

import React, { useEffect, useState } from "react";
import { CategoryId, GitHubRepo, TimeFilter } from "@/types/github";
import { CATEGORIES, TIME_FILTERS } from "@/lib/constants";
import { Header } from "@/components/layout/Header";
import { CategoryPills } from "@/components/dashboard/CategoryPills";
import { TimeframeSelector } from "@/components/dashboard/TimeframeSelector";
import { RepoCard } from "@/components/dashboard/RepoCard";
import { RepoCardSkeleton } from "@/components/dashboard/RepoCardSkeleton";
import { BreakthroughSpotlight } from "@/components/dashboard/BreakthroughSpotlight";
import { AIExplainModal } from "@/components/dashboard/AIExplainModal";
import {
  Sparkles,
  Flame,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Cpu,
  Layers,
  Radio,
  Zap,
  Rocket,
  Shield,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

export default function DashboardPage() {
  const [category, setCategory] = useState<CategoryId>("ai");
  const [timeframe, setTimeframe] = useState<TimeFilter>("daily");
  const [mode, setMode] = useState<"velocity" | "all-time">("velocity");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<number | undefined>(undefined);
  const [methodology, setMethodology] = useState<string>("");
  const [selectedRepoForAI, setSelectedRepoForAI] = useState<GitHubRepo | null>(null);

  // 400ms search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page when category, timeframe, mode or query change
  useEffect(() => {
    setPage(1);
  }, [category, timeframe, mode, debouncedQuery]);

  const fetchRepos = async (pageNum: number = 1, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const url = new URL("/api/github/trending", window.location.origin);
      url.searchParams.set("category", category);
      url.searchParams.set("timeframe", timeframe);
      url.searchParams.set("mode", mode);
      url.searchParams.set("page", pageNum.toString());
      if (debouncedQuery.trim()) {
        url.searchParams.set("q", debouncedQuery.trim());
      }

      const res = await fetch(url.toString());
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load trending repositories.");
      }

      if (append) {
        setRepos((prev) => [...prev, ...(data.repos || [])]);
      } else {
        setRepos(data.repos || []);
      }

      setHasMore(data.hasMore || false);
      setRateLimit(data.rateLimitRemaining);
      setMethodology(data.rankingMethodology || "");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchRepos(page, page > 1);
  }, [category, timeframe, mode, debouncedQuery, page]);

  const activeCategory = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];
  const activeTimeframe = TIME_FILTERS.find((t) => t.id === timeframe) || TIME_FILTERS[0];
  const spotlightRepo = repos.length > 0 ? repos[0] : null;

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Breakthrough Spotlight Hero */}
        {!loading && spotlightRepo && !searchQuery && page === 1 && (
          <BreakthroughSpotlight
            repo={spotlightRepo}
            categoryLabel={activeCategory.label}
            categoryDescription={activeCategory.description}
            categoryColor={activeCategory.accentColor}
            onExplainClick={(r) => setSelectedRepoForAI(r)}
          />
        )}

        {/* Global Filter Console Bar */}
        <div className="p-4 rounded-2xl bg-[#070b16]/90 border border-white/[0.08] shadow-xl space-y-3.5 backdrop-blur-xl">
          {/* Category Switcher Header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
              <span className="text-xs font-mono uppercase tracking-widest text-slate-300 font-bold">
                Domain Channels
              </span>
            </div>

            {/* Mode Toggle: Breakout Velocity vs Active Heavyweights */}
            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[#03060f] border border-white/[0.08]">
              <button
                onClick={() => setMode("velocity")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                  mode === "velocity"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Newly created repositories with rapid star growth"
              >
                <Rocket className="w-3 h-3 text-cyan-400" />
                <span>Breakout Feed</span>
              </button>

              <button
                onClick={() => setMode("all-time")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                  mode === "all-time"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Established repositories with high activity and commits"
              >
                <Flame className="w-3 h-3 text-purple-400" />
                <span>Heavyweights</span>
              </button>
            </div>
          </div>

          {/* Swipeable Category Pills */}
          <CategoryPills
            selectedCategory={category}
            onSelectCategory={(cat) => setCategory(cat)}
          />

          {/* Hairline Divider */}
          <div className="hairline-divider" />

          {/* Secondary Controls: Time Window & Methodology Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <TimeframeSelector
              selectedTimeframe={timeframe}
              onSelectTimeframe={(tf) => setTimeframe(tf)}
            />

            <div className="flex items-center gap-3 justify-between sm:justify-end text-xs font-mono">
              {!loading && (
                <div className="text-slate-400">
                  Indexing{" "}
                  <span className="text-cyan-400 font-bold">{repos.length}</span>{" "}
                  repositories
                </div>
              )}

              {rateLimit !== undefined && (
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] text-slate-400">
                  <span>Quota:</span>
                  <span className="text-emerald-400 font-bold">{rateLimit}</span>
                </div>
              )}

              <button
                onClick={() => fetchRepos(1, false)}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-slate-300 hover:text-white transition-all disabled:opacity-50"
                title="Refresh Live GitHub Stream"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`}
                />
                <span className="hidden sm:inline">Sync Stream</span>
              </button>
            </div>
          </div>

          {/* Transparent Ranking Methodology Banner */}
          {methodology && (
            <div className="px-3 py-1.5 rounded-xl bg-[#03060f]/60 border border-white/[0.05] flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 truncate">
                <HelpCircle className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">{methodology}</span>
              </span>
              <span className="text-slate-500 shrink-0 ml-2">GitHub Search API v3</span>
            </div>
          )}
        </div>

        {/* Discovery Grid */}
        {error ? (
          <div className="p-8 rounded-3xl bg-rose-950/20 border border-rose-800/60 text-center max-w-lg mx-auto space-y-3 shadow-2xl">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-rose-200">
              Ingestion Stream Interrupted
            </h3>
            <p className="text-xs text-rose-300/90 leading-relaxed font-mono">
              {error}
            </p>
            <button
              onClick={() => fetchRepos(1, false)}
              className="mt-3 px-5 py-2.5 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-white text-xs font-bold font-mono transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : loading && repos.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <RepoCardSkeleton key={i} />
            ))}
          </div>
        ) : repos.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto text-slate-400 shadow-xl">
              <Layers className="w-7 h-7 text-cyan-400" />
            </div>
            <h3 className="text-base font-bold text-slate-200">
              Zero Repositories Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-mono">
              No repositories matched your filters. Try toggling to &quot;Heavyweights&quot; or
              expanding to Weekly/Monthly windows.
            </p>
          </div>
        ) : (
          <div className="space-y-6 pb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {repos.map((repo, idx) => (
                <RepoCard
                  key={`${repo.id}-${idx}`}
                  repo={repo}
                  rankIndex={idx}
                  onExplainClick={(r) => setSelectedRepoForAI(r)}
                />
              ))}
            </div>

            {/* Pagination: Load More */}
            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loadingMore}
                  className="px-6 py-3 rounded-xl bg-[#090e1c] hover:bg-[#0d1629] border border-white/[0.1] text-xs font-mono font-bold text-slate-200 hover:text-white transition-all disabled:opacity-50 inline-flex items-center gap-2 shadow-lg"
                >
                  {loadingMore ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                      <span>Fetching Next 30 Repositories...</span>
                    </>
                  ) : (
                    <>
                      <span>Load Page {page + 1}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* AI Explanation Drawer Modal */}
      <AIExplainModal
        repo={selectedRepoForAI}
        onClose={() => setSelectedRepoForAI(null)}
      />
    </div>
  );
}
