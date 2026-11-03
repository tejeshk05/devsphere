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
} from "lucide-react";

export default function DashboardPage() {
  const [category, setCategory] = useState<CategoryId>("ai");
  const [timeframe, setTimeframe] = useState<TimeFilter>("daily");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<number | undefined>(undefined);
  const [selectedRepoForAI, setSelectedRepoForAI] = useState<GitHubRepo | null>(null);

  // 400ms search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchRepos = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL("/api/github/trending", window.location.origin);
      url.searchParams.set("category", category);
      url.searchParams.set("timeframe", timeframe);
      if (debouncedQuery.trim()) {
        url.searchParams.set("q", debouncedQuery.trim());
      }

      const res = await fetch(url.toString());
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load trending repositories.");
      }

      setRepos(data.repos || []);
      setRateLimit(data.rateLimitRemaining);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, [category, timeframe, debouncedQuery]);

  const activeCategory = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];
  const activeTimeframe = TIME_FILTERS.find((t) => t.id === timeframe) || TIME_FILTERS[0];
  const spotlightRepo = repos.length > 0 ? repos[0] : null;

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Breakthrough Spotlight Hero (Tier 1 Tech Bento) */}
        {!loading && spotlightRepo && !searchQuery && (
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
            <span className="text-[11px] font-mono text-slate-400">
              8 Curated Verticals
            </span>
          </div>

          {/* Swipeable Category Pills */}
          <CategoryPills
            selectedCategory={category}
            onSelectCategory={(cat) => setCategory(cat)}
          />

          {/* Hairline Divider */}
          <div className="hairline-divider" />

          {/* Secondary Controls: Time Window & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <TimeframeSelector
              selectedTimeframe={timeframe}
              onSelectTimeframe={(tf) => setTimeframe(tf)}
            />

            <div className="flex items-center gap-3 justify-between sm:justify-end text-xs font-mono">
              {!loading && (
                <div className="text-slate-400">
                  Indexing <span className="text-cyan-400 font-bold">{repos.length}</span>{" "}
                  live projects
                </div>
              )}

              {rateLimit !== undefined && (
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] text-slate-400">
                  <span>Quota:</span>
                  <span className="text-emerald-400 font-bold">{rateLimit}</span>
                </div>
              )}

              <button
                onClick={() => fetchRepos()}
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
              onClick={() => fetchRepos()}
              className="mt-3 px-5 py-2.5 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-white text-xs font-bold font-mono transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : loading ? (
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
              No repositories matched your filters. Try switching the time window or clearing
              the search term.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 pb-16">
            {repos.map((repo, idx) => (
              <RepoCard
                key={repo.id}
                repo={repo}
                rankIndex={idx}
                onExplainClick={(r) => setSelectedRepoForAI(r)}
              />
            ))}
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
