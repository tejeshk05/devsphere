"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GitHubRepo } from "@/types/github";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import { LANGUAGE_COLORS, DEFAULT_LANGUAGE_COLOR } from "@/lib/constants";
import { useBookmarks } from "@/context/BookmarkContext";
import {
  Star,
  GitFork,
  Clock,
  Bookmark,
  ExternalLink,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Copy,
  Check,
  Terminal,
  Layers,
} from "lucide-react";

interface RepoCardProps {
  repo: GitHubRepo;
  rankIndex?: number;
  onExplainClick?: (repo: GitHubRepo) => void;
}

export function RepoCard({ repo, rankIndex, onExplainClick }: RepoCardProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(repo.id);
  const [copiedClone, setCopiedClone] = useState(false);

  const languageColor =
    (repo.language && LANGUAGE_COLORS[repo.language]) || DEFAULT_LANGUAGE_COLOR;

  const handleCopyClone = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`git clone ${repo.html_url}.git`);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  const isTopRanked = rankIndex !== undefined && rankIndex < 3;

  return (
    <div className="mnc-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between group relative overflow-hidden">
      {/* Top Hairline Accent Line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${languageColor}, transparent)`,
        }}
      />

      <div>
        {/* Header Strip: Rank, Owner & Quick Actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Owner Avatar with Ring */}
            <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-slate-900 border border-white/[0.1] shrink-0 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={repo.owner.avatar_url}
                alt={repo.owner.login}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="min-w-0">
              <span className="text-[11px] font-mono text-slate-400 block truncate hover:text-cyan-400 transition-colors">
                @{repo.owner.login}
              </span>
              {rankIndex !== undefined && (
                <span
                  className={`text-[9px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.2 rounded ${
                    isTopRanked
                      ? "bg-amber-950/80 text-amber-300 border border-amber-800/60"
                      : "bg-slate-900 text-slate-500"
                  }`}
                >
                  #{String(rankIndex + 1).padStart(2, "0")} TRENDING
                </span>
              )}
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => toggleBookmark(repo)}
              className={`p-1.5 rounded-xl border transition-all ${
                bookmarked
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-md shadow-amber-950"
                  : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-amber-400 hover:bg-white/[0.06]"
              }`}
              title={bookmarked ? "Remove Bookmark" : "Save to Vault"}
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${bookmarked ? "fill-amber-400" : ""}`}
              />
            </button>

            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:text-cyan-400 hover:bg-white/[0.06] transition-colors"
              title="View on GitHub"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Repository Title */}
        <Link
          href={`/repo/${repo.owner.login}/${repo.name}`}
          className="block group/title mb-2"
        >
          <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight group-hover/title:text-cyan-300 transition-colors flex items-center justify-between gap-2">
            <span className="truncate">{repo.name}</span>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover/title:text-cyan-400 group-hover/title:translate-x-1 transition-all shrink-0" />
          </h3>
        </Link>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 mb-3.5 leading-relaxed min-h-[2.5rem]">
          {repo.description || "High-performance repository in AI and open-source."}
        </p>

        {/* Topics Pills */}
        {repo.topics && repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {repo.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#070b16] border border-white/[0.07] text-slate-400 hover:text-cyan-300 transition-colors"
              >
                #{topic}
              </span>
            ))}
            {repo.topics.length > 3 && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900/60 text-slate-500">
                +{repo.topics.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Historical Velocity & Growth Telemetry */}
        {repo.velocity && (
          <div className="p-2.5 rounded-xl bg-[#030611]/90 border border-white/[0.07] font-mono text-[11px] space-y-1.5 mb-3.5 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                {repo.velocity.status === "active" ? (
                  <span className="text-emerald-300 font-bold">
                    +{repo.velocity.starsGained} stars
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold text-[10px]">
                    Collecting baseline...
                  </span>
                )}
              </div>

              {repo.velocity.status === "active" ? (
                <span className="text-slate-300 text-[10px]">
                  {repo.velocity.starsPerHour} ★/hr ({repo.velocity.percentageGrowth}%)
                </span>
              ) : (
                <span className="text-slate-500 text-[10px]">Indexed recently</span>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-white/[0.04]">
              <span>
                Baseline:{" "}
                {new Date(repo.velocity.firstSnapshotDate).toLocaleDateString()}
              </span>
              <span>Updated {formatRelativeTime(repo.updated_at || repo.pushed_at)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Metrics & Actions */}
      <div className="pt-3 border-t border-white/[0.06] mt-auto space-y-3">
        {/* Metric Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 gap-2">
          {/* Primary Language */}
          {repo.language ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-2 h-2 rounded-full shrink-0 shadow-[0_0_6px]"
                style={{
                  backgroundColor: languageColor,
                  color: languageColor,
                }}
              />
              <span className="truncate text-slate-200 font-mono text-xs font-medium">
                {repo.language}
              </span>
            </div>
          ) : (
            <span className="text-[11px] font-mono text-slate-500">Documentation</span>
          )}

          {/* Telemetry counters */}
          <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{formatNumber(repo.stargazers_count)}</span>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <GitFork className="w-3 h-3 text-cyan-400" />
              <span>{formatNumber(repo.forks_count)}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-slate-500 text-[11px]">
              <Clock className="w-3 h-3 text-slate-600" />
              <span>{formatRelativeTime(repo.updated_at || repo.pushed_at)}</span>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {/* Git Clone Copy Chip */}
          <button
            onClick={handleCopyClone}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
            title="Copy git clone"
          >
            <Terminal className="w-3 h-3 text-slate-500" />
            <span>{copiedClone ? "Copied!" : "git clone"}</span>
            {copiedClone ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-2.5 h-2.5 text-slate-500" />
            )}
          </button>

          {/* AI Intelligence Deep-Dive Trigger */}
          <button
            onClick={() => onExplainClick?.(repo)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border border-purple-700/60 text-purple-300 hover:text-white hover:border-purple-500 text-[11px] font-mono font-medium transition-all shadow-sm"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>AI Architecture</span>
          </button>
        </div>
      </div>
    </div>
  );
}
