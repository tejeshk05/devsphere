"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GitHubRepo } from "@/types/github";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import { LANGUAGE_COLORS, DEFAULT_LANGUAGE_COLOR } from "@/lib/constants";
import {
  Sparkles,
  Flame,
  Star,
  GitFork,
  ArrowRight,
  ExternalLink,
  Terminal,
  Copy,
  Check,
  TrendingUp,
  Cpu,
  Layers,
} from "lucide-react";

interface BreakthroughSpotlightProps {
  repo: GitHubRepo | null;
  categoryLabel: string;
  categoryDescription: string;
  categoryColor: string;
  onExplainClick?: (repo: GitHubRepo) => void;
}

export function BreakthroughSpotlight({
  repo,
  categoryLabel,
  categoryDescription,
  categoryColor,
  onExplainClick,
}: BreakthroughSpotlightProps) {
  const [copied, setCopied] = useState(false);

  if (!repo) return null;

  const languageColor =
    (repo.language && LANGUAGE_COLORS[repo.language]) || DEFAULT_LANGUAGE_COLOR;

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(`git clone ${repo.html_url}.git`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bento-hero border border-white/[0.12] p-6 sm:p-8 group shadow-2xl">
      {/* Background Radial Glow */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700 group-hover:opacity-30"
        style={{ backgroundColor: categoryColor }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Column: Metadata & Title */}
        <div className="space-y-3.5 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/40 text-amber-300 shadow-sm">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              #01 Top Velocity Spotlight
            </span>
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Ingestion Feed
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono text-cyan-400">@{repo.owner.login}</span>
              <span className="text-slate-600">/</span>
              <span className="text-xs font-mono text-slate-400">{categoryLabel} Hub</span>
            </div>
            <Link
              href={`/repo/${repo.owner.login}/${repo.name}`}
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight hover:text-cyan-300 transition-colors flex items-center gap-2"
            >
              <span>{repo.name}</span>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            {repo.description || categoryDescription}
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-4 sm:gap-6 pt-1 flex-wrap text-xs font-mono">
            {repo.language && (
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px]"
                  style={{ backgroundColor: languageColor, color: languageColor }}
                />
                <span className="text-slate-200 font-semibold">{repo.language}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{formatNumber(repo.stargazers_count)} Stargazers</span>
            </div>

            <div className="flex items-center gap-1.5 text-cyan-400">
              <GitFork className="w-3.5 h-3.5" />
              <span>{formatNumber(repo.forks_count)} Forks</span>
            </div>

            <div className="text-slate-400">
              Pushed: {formatRelativeTime(repo.pushed_at || repo.updated_at)}
            </div>
          </div>
        </div>

        {/* Right Column: High-Impact CTAs & Quick Clone */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 lg:min-w-[220px]">
          <button
            onClick={() => onExplainClick?.(repo)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-purple-950 duration-200 group/btn"
          >
            <Sparkles className="w-4 h-4 text-purple-200 group-hover/btn:rotate-12 transition-transform" />
            <span>AI Architecture Insight</span>
          </button>

          <Link
            href={`/repo/${repo.owner.login}/${repo.name}`}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 font-mono text-xs font-medium transition-colors"
          >
            <span>Inspect Documentation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#03060d]/90 border border-white/[0.08] text-[11px] font-mono text-slate-400 hover:text-white transition-colors"
          >
            <Terminal className="w-3 h-3 text-cyan-400" />
            <span>{copied ? "Command Copied!" : "git clone repo"}</span>
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3 text-slate-500" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

