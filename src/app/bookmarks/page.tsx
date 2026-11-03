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
      `devsphere-bookmarks-${new Date().toISOString().split("T")[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-30 w-full bg-[#080c14]/80 backdrop-blur-md border-b border-slate-800/60 px-4 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Saved Bookmarks</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                {bookmarks.length}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {bookmarks.length > 0 && (
              <>
                <button
                  onClick={exportBookmarks}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
                  title="Export Bookmarks JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to clear all saved bookmarks?")) {
                      clearBookmarks();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 hover:bg-rose-900/40 transition-colors"
                  title="Clear All Bookmarks"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear All</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Search within bookmarks */}
        {bookmarks.length > 0 && (
          <div className="max-w-md relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter saved bookmarks..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/90 text-sm text-slate-100 placeholder-slate-400 rounded-xl border border-slate-800 focus:border-cyan-500/50 focus:outline-none"
            />
          </div>
        )}

        {/* Empty state */}
        {bookmarks.length === 0 ? (
          <div className="py-24 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-amber-400 shadow-xl shadow-amber-950/20">
              <Bookmark className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">No bookmarks saved yet</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              When exploring trending AI and open-source repositories on the dashboard,
              click the bookmark icon on any card to save it here for offline reference.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-semibold text-xs hover:bg-cyan-400 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore Trending Repos</span>
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-sm text-slate-300">
              No bookmarks match &quot;{searchFilter}&quot;
            </p>
            <button
              onClick={() => setSearchFilter("")}
              className="text-xs text-cyan-400 hover:underline"
            >
              Clear filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 pb-16">
            {filtered.map((repo) => (
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

