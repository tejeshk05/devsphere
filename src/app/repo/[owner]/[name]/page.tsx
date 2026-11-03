"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { marked } from "marked";
import { GitHubRepo } from "@/types/github";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import { LANGUAGE_COLORS, DEFAULT_LANGUAGE_COLOR } from "@/lib/constants";
import { useBookmarks } from "@/context/BookmarkContext";
import { AIExplainModal } from "@/components/dashboard/AIExplainModal";
import {
  ArrowLeft,
  Star,
  GitFork,
  Eye,
  AlertCircle,
  Clock,
  Bookmark,
  ExternalLink,
  Sparkles,
  Copy,
  Check,
  FileText,
  Terminal,
  Shield,
  Loader2,
  GitBranch,
  Layers,
  Code2,
} from "lucide-react";

export default function RepoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const owner = params.owner as string;
  const name = params.name as string;

  const [repo, setRepo] = useState<GitHubRepo | null>(null);
  const [readme, setReadme] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedClone, setCopiedClone] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  const { isBookmarked, toggleBookmark } = useBookmarks();

  useEffect(() => {
    if (!owner || !name) return;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/github/repo?owner=${owner}&name=${name}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load repository details.");
        }
        setRepo(data.repo);
        setReadme(data.readme);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error loading repository");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [owner, name]);

  const bookmarked = repo ? isBookmarked(repo.id) : false;
  const languageColor =
    (repo?.language && LANGUAGE_COLORS[repo.language]) || DEFAULT_LANGUAGE_COLOR;

  const handleCopyClone = () => {
    if (!repo) return;
    navigator.clipboard.writeText(`git clone ${repo.html_url}.git`);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-30 w-full bg-[#040711]/85 backdrop-blur-xl border-b border-white/[0.07] px-4 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
              <Link href="/" className="hover:text-cyan-400">
                Grid
              </Link>
              <span>/</span>
              <span>{owner}</span>
              <span>/</span>
              <span className="text-white font-bold">{name}</span>
            </div>
          </div>

          {repo && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleBookmark(repo)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                  bookmarked
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-md shadow-amber-950"
                    : "bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-white/[0.06]"
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? "fill-amber-400" : ""}`} />
                <span>{bookmarked ? "Saved" : "Save Vault"}</span>
              </button>

              <button
                onClick={() => setShowAIModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-950/90 to-indigo-950/90 border border-purple-700/60 text-purple-300 text-xs font-mono font-medium hover:border-purple-500 transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">AI Analysis</span>
              </button>

              <a
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-mono font-medium hover:bg-cyan-900/60 transition-colors"
              >
                <span>GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3 font-mono">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-xs text-slate-400">
              Synchronizing repository details from GitHub API...
            </p>
          </div>
        ) : error || !repo ? (
          <div className="p-8 rounded-3xl bg-rose-950/20 border border-rose-800 text-center max-w-md mx-auto space-y-3 font-mono">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-rose-200">
              Repository Not Discovered
            </h3>
            <p className="text-xs text-rose-300/90 leading-relaxed">{error}</p>
            <Link
              href="/"
              className="inline-block mt-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-slate-200 hover:bg-white/[0.1]"
            >
              Return to Discovery Grid
            </Link>
          </div>
        ) : (
          <>
            {/* Repo Header Hero (Bento Style) */}
            <div className="p-6 sm:p-8 rounded-3xl bento-hero border border-white/[0.1] space-y-5 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-900 border border-white/[0.12] shrink-0 shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={repo.owner.avatar_url}
                      alt={repo.owner.login}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-cyan-400">
                        @{repo.owner.login}
                      </span>
                      <span className="text-slate-600 font-mono">/</span>
                      <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {repo.name}
                      </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed max-w-3xl">
                      {repo.description || "No description provided."}
                    </p>
                  </div>
                </div>

                {/* Git Clone Snippet Pill */}
                <div className="flex items-center gap-2 self-start bg-[#03060f] border border-white/[0.1] px-3 py-1.5 rounded-xl shadow-inner">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-mono text-slate-300">
                    git clone {name}.git
                  </span>
                  <button
                    onClick={handleCopyClone}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                    title="Copy Git Clone Command"
                  >
                    {copiedClone ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Topics Pills */}
              {repo.topics && repo.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {repo.topics.map((topic) => (
                    <span
                      key={topic}
                      className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#070b16] border border-white/[0.08] text-slate-300"
                    >
                      #{topic}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bento Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 font-mono">
              <div className="p-4 rounded-2xl mnc-card flex items-center gap-3">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <div>
                  <div className="text-lg font-black text-white">
                    {formatNumber(repo.stargazers_count)}
                  </div>
                  <div className="text-[11px] text-slate-500 uppercase">Stargazers</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl mnc-card flex items-center gap-3">
                <GitFork className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="text-lg font-black text-white">
                    {formatNumber(repo.forks_count)}
                  </div>
                  <div className="text-[11px] text-slate-500 uppercase">Forks</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl mnc-card flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <div>
                  <div className="text-lg font-black text-white">
                    {repo.open_issues_count}
                  </div>
                  <div className="text-[11px] text-slate-500 uppercase">Open Issues</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl mnc-card flex items-center gap-3">
                <Clock className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-sm font-bold text-white truncate">
                    {formatRelativeTime(repo.pushed_at || repo.updated_at)}
                  </div>
                  <div className="text-[11px] text-slate-500 uppercase">Last Activity</div>
                </div>
              </div>
            </div>

            {/* Documentation README section */}
            <div className="p-6 sm:p-8 rounded-3xl mnc-card space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono font-bold text-white tracking-widest uppercase">
                    DOCUMENTATION // README.md
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                  <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                  <span>Branch: {repo.default_branch}</span>
                </div>
              </div>

              {readme ? (
                <div
                  className="prose prose-invert max-w-none text-slate-300 text-xs sm:text-sm leading-relaxed overflow-x-auto space-y-4 font-sans [&_a]:text-cyan-400 [&_a:hover]:underline [&_pre]:bg-[#03060f] [&_pre]:p-4 [&_pre]:rounded-2xl [&_pre]:border [&_pre]:border-white/[0.08] [&_code]:font-mono [&_code]:text-cyan-300 [&_h1]:text-white [&_h1]:text-xl [&_h2]:text-white [&_h2]:text-lg [&_h3]:text-slate-100 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                  dangerouslySetInnerHTML={{ __html: marked.parse(readme) as string }}
                />
              ) : (
                <div className="py-12 text-center text-xs text-slate-500 font-mono">
                  No README.md discovered for this repository on branch {repo.default_branch}.
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* AI Explanation Drawer Modal */}
      <AIExplainModal
        repo={showAIModal ? repo : null}
        onClose={() => setShowAIModal(false)}
      />
    </div>
  );
}
