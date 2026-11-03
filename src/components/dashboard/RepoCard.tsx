"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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
} from "lucide-react";

interface RepoCardProps {
  repo: GitHubRepo;
  onExplainClick?: (repo: GitHubRepo) => void;
}

export function RepoCard({ repo, onExplainClick }: RepoCardProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(repo.id);

  const languageColor =
    (repo.language && LANGUAGE_COLORS[repo.language]) || DEFAULT_LANGUAGE_COLOR;

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between group relative border border-slate-800/80 hover:border-cyan-500/30 transition-all duration-200">
      <div>
        {/* Top Header: Owner info & Actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Owner Avatar */}
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-800 border border-slate-700/80 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={repo.owner.avatar_url}
                alt={repo.owner.login}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <span className="text-xs font-mono text-slate-400 truncate hover:text-slate-200 transition-colors">
              {repo.owner.login}
            </span>
          </div>

          {/* Quick Action Icons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => toggleBookmark(repo)}
              className={`p-1.5 rounded-lg border transition-all ${
                bookmarked
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-sm shadow-amber-950"
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-800"
              }`}
              title={bookmarked ? "Remove Bookmark" : "Save Bookmark"}
            >
              <Bookmark
                className={`w-4 h-4 ${bookmarked ? "fill-amber-400" : ""}`}
              />
            </button>

            <a
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
              title="Open on GitHub"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Repository Title */}
        <Link
          href={`/repo/${repo.owner.login}/${repo.name}`}
          className="block group/title mb-2"
        >
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover/title:text-cyan-300 transition-colors flex items-center gap-1.5">
            <span className="truncate">{repo.name}</span>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover/title:text-cyan-400 group-hover/title:translate-x-0.5 transition-all shrink-0" />
          </h3>
        </Link>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 mb-4 leading-relaxed min-h-[2.5rem]">
          {repo.description || "No description provided for this repository."}
        </p>

        {/* Topics Pills */}
        {repo.topics && repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {repo.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-800 text-slate-400"
              >
                #{topic}
              </span>
            ))}
            {repo.topics.length > 3 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-500">
                +{repo.topics.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Info & Metrics */}
      <div className="pt-3 border-t border-slate-800/60 mt-auto">
        <div className="flex items-center justify-between text-xs text-slate-400 gap-2">
          {/* Primary Language */}
          {repo.language ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: languageColor }}
              />
              <span className="truncate text-slate-300 font-medium">
                {repo.language}
              </span>
            </div>
          ) : (
            <span className="text-slate-500">Text/Doc</span>
          )}

          {/* Metrics: Stars, Forks, Updated Time */}
          <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
            <div className="flex items-center gap-1 text-amber-400 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{formatNumber(repo.stargazers_count)}</span>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <GitFork className="w-3.5 h-3.5" />
              <span>{formatNumber(repo.forks_count)}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-slate-500">
              <Clock className="w-3 h-3" />
              <span>{formatRelativeTime(repo.updated_at || repo.pushed_at)}</span>
            </div>
          </div>
        </div>

        {/* AI Explanation Trigger Button */}
        <div className="mt-3 pt-2.5 flex items-center justify-between">
          <Link
            href={`/repo/${repo.owner.login}/${repo.name}`}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
          >
            Inspect details & README
          </Link>

          <button
            onClick={() => onExplainClick?.(repo)}
            className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-800/50 text-purple-300 hover:bg-purple-900/60 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>AI Summary</span>
          </button>
        </div>
      </div>
    </div>
  );
}

