"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CategoryId, GitHubRepo, TimeFilter, TrendingMode } from "@/types/github";
import { CATEGORIES, TIME_FILTERS, TRENDING_MODES } from "@/lib/constants";
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
  Database,
} from "lucide-react";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCategoryParam = searchParams.get("category") as CategoryId | null;

  const [category, setCategory] = useState<CategoryId>(
    urlCategoryParam && CATEGORIES.some((c) => c.id === urlCategoryParam)
      ? urlCategoryParam
      : "ai"
  );
  const [timeframe, setTimeframe] = useState<TimeFilter>("24h");
  const [mode, setMode] = useState<TrendingMode>("fastest-growing");
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
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestNotice, setIngestNotice] = useState<string | null>(null);

  // Sync category if URL search param changes (e.g. clicking sidebar AI Focus Channels)
  useEffect(() => {
    const param = searchParams.get("category") as CategoryId | null;
    if (param && CATEGORIES.some((c) => c.id === param) && param !== category) {
      setCategory(param);
    }
  }, [searchParams, category]);

  const handleSelectCategory = (cat: CategoryId) => {
    setCategory(cat);
    router.replace(`/?category=${cat}`, { scroll: false });
  };

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

  const handleManualIngest = async () => {
    setIsIngesting(true);
    setIngestNotice(null);
    try {
      const res = await fetch("/api/github/ingest", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setIngestNotice(
          `Snapshot Ingestion Complete: ${data.summary?.newSnapshots ?? 0} new snapshots recorded.`
        );
        fetchRepos(1, false);
      } else {
        setIngestNotice(`Ingestion error: ${data.error}`);
      }
    } catch (e: unknown) {
      setIngestNotice(`Failed to trigger worker: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsIngesting(false);
      setTimeout(() => setIngestNotice(null), 6000);
    }
  };

  useEffect(() => {
    fetchRepos(page, page > 1);
  }, [category, timeframe, mode, debouncedQuery, page]);

  const activeCategory = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];
  const spotlightRepo = repos.length > 0 ? repos[0] : null;

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 pb-28 md:pb-8 space-y-6">
        {/* Ingestion Notification Banner */}
        {ingestNotice && (
          <div className="p-3 rounded-2xl bg-cyan-950/70 border border-cyan-800 text-cyan-200 text-xs font-mono flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>{ingestNotice}</span>
            </span>
            <button
              onClick={() => setIngestNotice(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
              <span className="text-xs font-mono uppercase tracking-widest text-slate-300 font-bold">
                Domain Channels
              </span>
            </div>

            {/* 4 Multi-Mode Ranking Selectors */}
            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[#03060f] border border-white/[0.08] overflow-x-auto no-scrollbar">
              <button
                onClick={() => setMode("fastest-growing")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all whitespace-nowrap ${
                  mode === "fastest-growing"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Ranked by measured star growth rate across historical hourly snapshots"
              >
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span>Fastest Growing</span>
              </button>

              <button
                onClick={() => setMode("new-releases")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all whitespace-nowrap ${
                  mode === "new-releases"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Newly born repositories in this timeframe"
              >
                <Rocket className="w-3 h-3 text-cyan-400" />
                <span>New Releases</span>
              </button>

              <button
                onClick={() => setMode("rising-ai")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all whitespace-nowrap ${
                  mode === "rising-ai"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="AI frameworks exhibiting rapid percentage adoption"
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Rising AI</span>
              </button>

              <button
                onClick={() => setMode("popular")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all whitespace-nowrap ${
                  mode === "popular"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Category leaders sorted by cumulative lifetime stars"
              >
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Popular</span>
              </button>
            </div>
          </div>

          {/* Swipeable Category Pills */}
          <CategoryPills
            selectedCategory={category}
            onSelectCategory={handleSelectCategory}
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
                  Tracking{" "}
                  <span className="text-cyan-400 font-bold">{repos.length}</span>{" "}
                  repositories
                </div>
              )}

              {rateLimit !== undefined && (
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] text-slate-400">
                  <span>GitHub Quota:</span>
                  <span className="text-emerald-400 font-bold">{rateLimit}</span>
                </div>
              )}

              <button
                onClick={handleManualIngest}
                disabled={isIngesting || loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 text-xs text-cyan-300 hover:text-white transition-all disabled:opacity-50 shadow-sm"
                title="Run hourly ingestion worker now"
              >
                <Database
                  className={`w-3.5 h-3.5 ${isIngesting ? "animate-pulse text-cyan-300" : ""}`}
                />
                <span className="hidden sm:inline">
                  {isIngesting ? "Ingesting..." : "Ingest Snapshot"}
                </span>
              </button>

              <button
                onClick={() => fetchRepos(1, false)}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-slate-300 hover:text-white transition-all disabled:opacity-50"
                title="Refresh Live Data"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`}
                />
                <span className="hidden sm:inline">Sync</span>
              </button>
            </div>
          </div>

          {/* Transparent Ranking Methodology Banner */}
          {methodology && (
            <div className="px-3.5 py-2 rounded-xl bg-[#03060f]/80 border border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-300">
              <span className="flex items-center gap-2 truncate">
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">{methodology}</span>
              </span>
              <span className="hidden md:inline-block shrink-0 text-[10px] text-slate-500 font-mono">
                Formula: (Δstars / Δhours)
              </span>
            </div>
          )}
        </div>

        {/* Repository Grid / States */}
        {loading && !loadingMore ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {Array.from({ length: 9 }).map((_, idx) => (
              <RepoCardSkeleton key={idx} />
            ))}
          </div>
        ) : error ? (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Data Synchronization Interrupted
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">{error}</p>
            <button
              onClick={() => fetchRepos(1, false)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-mono text-slate-300 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Fetch</span>
            </button>
          </div>
        ) : repos.length === 0 ? (
          <div className="py-24 text-center space-y-3 font-mono">
            <p className="text-xs text-slate-400">
              No repositories tracked under this criteria.
            </p>
            <button
              onClick={() => {
                setCategory("ai");
                setTimeframe("24h");
                setMode("fastest-growing");
              }}
              className="text-xs text-cyan-400 hover:underline"
            >
              Reset to All AI Repositories
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {repos.map((repo, idx) => (
                <RepoCard
                  key={repo.id}
                  repo={repo}
                  rankIndex={idx}
                  onExplainClick={(r) => setSelectedRepoForAI(r)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {hasMore && (
              <div className="flex justify-center pt-2 pb-8">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-slate-300 hover:text-white transition-all disabled:opacity-50 shadow-sm"
                >
                  {loadingMore ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                      <span>Loading Next Page...</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                      <span>Load More Repositories</span>
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

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#040711] flex flex-col items-center justify-center text-slate-500 font-mono text-xs gap-3">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span>CONNECTING TO DEVSPHERE RADAR...</span>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
