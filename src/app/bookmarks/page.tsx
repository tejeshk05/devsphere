"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useBookmarks } from "@/context/BookmarkContext";
import { RepoCard } from "@/components/dashboard/RepoCard";
import { AIExplainModal } from "@/components/dashboard/AIExplainModal";
import { GitHubRepo } from "@/types/github";
import {
  Bookmark,
  Search,
  Trash2,
  Download,
  ArrowLeft,
  Sparkles,
  Layers,
  Database,
  Radio,
} from "lucide-react";

export default function BookmarksPage() {
  const { bookmarks, clearBookmarks } = useBookmarks();
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedRepoForAI, setSelectedRepoForAI] = useState<GitHubRepo | null>(null);

  const filtered = bookmarks.filter((repo) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      repo.name.toLowerCase().includes(term) ||
      repo.owner.login.toLowerCase().includes(term) ||
      (repo.description && repo.description.toLowerCase().includes(term)) ||
      (repo.language && repo.language.toLowerCase().includes(term))
    );
  });

  const exportBookmarks = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(bookmarks, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `devsphere-vault-${new Date().toISOString().split("T")[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-30 w-full bg-[#040711]/85 backdrop-blur-xl border-b border-white/[0.07] px-4 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2 tracking-tight">
                <Bookmark className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Personal Repository Vault</span>
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-amber-300">
                {bookmarks.length} SAVED
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {bookmarks.length > 0 && (
              <>
                <button
                  onClick={exportBookmarks}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-slate-300 hover:text-white transition-all shadow-sm"
                  title="Export Vault JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export JSON</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to clear all repositories in your vault?")) {
                      clearBookmarks();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs font-mono text-rose-300 hover:bg-rose-900/40 transition-colors"
                  title="Clear All Bookmarks"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Purge</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Search within bookmarks */}
        {bookmarks.length > 0 && (
          <div className="max-w-md relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter saved repositories..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#070b16]/90 text-xs text-slate-100 placeholder-slate-500 rounded-xl border border-white/[0.08] focus:border-cyan-500/60 focus:outline-none font-mono transition-all"
            />
          </div>
        )}

        {/* Empty state */}
        {bookmarks.length === 0 ? (
          <div className="py-24 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-[#070b16] border border-white/[0.1] flex items-center justify-center mx-auto text-amber-400 shadow-2xl shadow-amber-950/30">
              <Bookmark className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Vault Is Currently Empty
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-mono">
              Bookmark trending repositories from the Discovery Grid to persist them here for
              offline study, architectural audits, and benchmarking.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-950"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore Live AI Repos</span>
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-2 font-mono">
            <p className="text-xs text-slate-400">
              Zero bookmarks matched &quot;{searchFilter}&quot;
            </p>
            <button
              onClick={() => setSearchFilter("")}
              className="text-xs text-cyan-400 hover:underline"
            >
              Reset filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 pb-16">
            {filtered.map((repo, idx) => (
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
