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
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-30 w-full bg-[#080c14]/80 backdrop-blur-md border-b border-slate-800/60 px-4 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
              <Link href="/" className="hover:text-cyan-400">
                Discovery
              </Link>
              <span>/</span>
              <span>{owner}</span>
              <span>/</span>
              <span className="text-white font-semibold">{name}</span>
            </div>
          </div>

          {repo && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleBookmark(repo)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                  bookmarked
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? "fill-amber-400" : ""}`} />
                <span>{bookmarked ? "Bookmarked" : "Bookmark"}</span>
              </button>

              <button
                onClick={() => setShowAIModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-800/60 text-purple-300 text-xs font-medium hover:bg-purple-900/60 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">AI Analysis</span>
              </button>

              <a
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-medium hover:bg-cyan-900/60 transition-colors"
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
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-sm text-slate-400 font-mono">
              Fetching live repository details from GitHub...
            </p>
          </div>
        ) : error || !repo ? (
          <div className="p-8 rounded-2xl bg-rose-950/20 border border-rose-800 text-center max-w-md mx-auto space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-base font-semibold text-rose-200">
              Repository Not Found
            </h3>
            <p className="text-xs text-rose-300 leading-relaxed">{error}</p>
            <Link
              href="/"
              className="inline-block mt-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 hover:bg-slate-800"
            >
              Return to Discovery
            </Link>
          </div>
        ) : (
          <>
            {/* Repo Header Hero */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
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
                        {repo.owner.login}
                      </span>
                      <span className="text-slate-600">/</span>
                      <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        {repo.name}
                      </h1>
                    </div>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed max-w-3xl">
                      {repo.description || "No description provided."}
                    </p>
                  </div>
                </div>

                {/* Git Clone Snippet */}
                <div className="flex items-center gap-2 self-start bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs font-mono text-slate-400">
                    git clone ...
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
                      className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300"
                    >
                      #{topic}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Metrics Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <div>
                  <div className="text-lg font-bold font-mono text-white">
                    {formatNumber(repo.stargazers_count)}
                  </div>
                  <div className="text-xs text-slate-400">Stargazers</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                <GitFork className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="text-lg font-bold font-mono text-white">
                    {formatNumber(repo.forks_count)}
                  </div>
                  <div className="text-xs text-slate-400">Forks</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <div>
                  <div className="text-lg font-bold font-mono text-white">
                    {repo.open_issues_count}
                  </div>
                  <div className="text-xs text-slate-400">Open Issues</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                <Clock className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-sm font-semibold text-white">
                    {formatRelativeTime(repo.pushed_at || repo.updated_at)}
                  </div>
                  <div className="text-xs text-slate-400">Last Pushed</div>
                </div>
              </div>
            </div>

            {/* README Content Viewer */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-mono font-semibold text-slate-200 uppercase">
                    README.md
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Branch: {repo.default_branch}
                </span>
              </div>

              {readme ? (
                <div
                  className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed overflow-x-auto space-y-4 font-sans [&_a]:text-cyan-400 [&_a:hover]:underline [&_pre]:bg-slate-950 [&_pre]:p-4 [&_pre]:rounded-xl [&_code]:font-mono [&_code]:text-cyan-300 [&_h1]:text-white [&_h2]:text-white [&_h3]:text-slate-100 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                  dangerouslySetInnerHTML={{ __html: marked.parse(readme) as string }}
                />
              ) : (
                <div className="py-12 text-center text-xs text-slate-400 font-mono">
                  No README.md discovered for this repository.
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* AI Explanation Modal */}
      <AIExplainModal
        repo={showAIModal ? repo : null}
        onClose={() => setShowAIModal(false)}
      />
    </div>
  );
}

