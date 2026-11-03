"use client";

import React, { useEffect, useState, useTransition } from "react";
import { CategoryId, GitHubRepo, TimeFilter } from "@/types/github";
import { CATEGORIES, TIME_FILTERS } from "@/lib/constants";
import { Header } from "@/components/layout/Header";
import { CategoryPills } from "@/components/dashboard/CategoryPills";
import { TimeframeSelector } from "@/components/dashboard/TimeframeSelector";
import { RepoCard } from "@/components/dashboard/RepoCard";
import { RepoCardSkeleton } from "@/components/dashboard/RepoCardSkeleton";
import { AIExplainModal } from "@/components/dashboard/AIExplainModal";
import {
  Sparkles,
  Flame,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Cpu,
  Layers,
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

  // Debounce search input by 400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch live repositories from server route
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

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Hero Banner with Glow */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 p-6 sm:p-8">
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none"
            style={{ backgroundColor: activeCategory.accentColor }}
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-cyan-950/80 border border-cyan-800/60 text-cyan-300">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Live GitHub Pulse
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {activeTimeframe.period}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <span>{activeCategory.label}</span>
                <span className="text-slate-500 font-light text-xl sm:text-2xl">
                  Trending Repositories
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                {activeCategory.description}. Curated real-time discovery based on GitHub
                stars, developer commits, and active community velocity.
              </p>
            </div>

            {/* Quick Action / Status Badge */}
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>GitHub API Connected</span>
              </div>
              {rateLimit !== undefined && (
                <div className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                  Quota Remaining: <span className="text-cyan-300">{rateLimit}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="space-y-4">
          {/* Category Horizontal Scroll Pills */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Select Domain Category
              </span>
              <span className="text-xs text-slate-400">
                {CATEGORIES.length} Specialized Hubs
              </span>
            </div>
            <CategoryPills
              selectedCategory={category}
              onSelectCategory={(cat) => {
                setCategory(cat);
              }}
            />
          </div>

          {/* Timeframe & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <TimeframeSelector
              selectedTimeframe={timeframe}
              onSelectTimeframe={(tf) => setTimeframe(tf)}
            />

            <div className="flex items-center gap-2 justify-between sm:justify-end">
              <div className="text-xs text-slate-400 font-mono">
                {!loading && (
                  <span>
                    Found <strong className="text-slate-200">{repos.length}</strong>{" "}
                    active projects
                  </span>
                )}
              </div>

              <button
                onClick={() => fetchRepos()}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-850 transition-colors disabled:opacity-50"
                title="Refresh trending data"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Repository Grid / Content */}
        {error ? (
          <div className="p-8 rounded-2xl bg-rose-950/20 border border-rose-800/50 text-center max-w-lg mx-auto space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-base font-semibold text-rose-200">
              Unable to discover repositories
            </h3>
            <p className="text-xs text-rose-300 leading-relaxed">{error}</p>
            <button
              onClick={() => fetchRepos()}
              className="mt-2 px-4 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-100 text-xs font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <RepoCardSkeleton key={i} />
            ))}
          </div>
        ) : repos.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-200">
              No matching repositories found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No repositories matched your query in this timeframe. Try clearing your search
              term or expanding to weekly/monthly trends.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 pb-16">
            {repos.map((repo) => (
              <RepoCard
                key={repo.id}
                repo={repo}
                onExplainClick={(r) => setSelectedRepoForAI(r)}
              />
            ))}
          </div>
        )}
      </main>

      {/* AI Explanation Modal */}
      <AIExplainModal
        repo={selectedRepoForAI}
        onClose={() => setSelectedRepoForAI(null)}
      />
    </div>
  );
}
