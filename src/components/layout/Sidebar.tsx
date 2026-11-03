"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Bookmark,
  Sparkles,
  ShieldCheck,
  Layers,
  Activity,
} from "lucide-react";
import { useBookmarks } from "@/context/BookmarkContext";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { bookmarks } = useBookmarks();

  const navItems = [
    {
      label: "Trending Discovery",
      href: "/",
      icon: Compass,
      badge: "Live",
    },
    {
      label: "Saved Bookmarks",
      href: "/bookmarks",
      icon: Bookmark,
      count: bookmarks.length,
    },
    {
      label: "AI Explanations",
      href: "/ai-explainer",
      icon: Sparkles,
      tag: "v2 Ready",
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-[#070b12] border-r border-slate-800/80 z-40 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/60">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
            <div className="w-full h-full bg-[#090d16] rounded-xl flex items-center justify-center">
              <Layers className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                DevSphere
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400">AI & Tech Discovery</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
        <div className="px-3 pb-2 text-[11px] font-mono uppercase tracking-wider text-slate-400">
          Platform
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? "bg-slate-800/90 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-950"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-cyan-400" : "text-slate-400"
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 animate-pulse">
                  {item.badge}
                </span>
              )}

              {item.count !== undefined && item.count > 0 && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  {item.count}
                </span>
              )}

              {item.tag && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-800/60 text-purple-300">
                  {item.tag}
                </span>
              )}
            </Link>
          );
        })}

        {/* Categories Quick Link Section */}
        <div className="pt-6 px-3 pb-2 text-[11px] font-mono uppercase tracking-wider text-slate-400">
          Core AI Verticals
        </div>
        <div className="space-y-1 px-1">
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>LLMs & Agents</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            <span>Generative AI</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>RAG & Vector Search</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>Computer Vision & MLOps</span>
          </div>
        </div>
      </div>

      {/* Footer / Status Pill */}
      <div className="p-4 border-t border-slate-800/60 bg-[#060910]">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-300 font-mono">Live GitHub API</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-900/60">
            Online
          </span>
        </div>

        {/* Private Account Card */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Owner Access</p>
              <p className="text-[10px] text-slate-400">Protected Mode</p>
            </div>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-white transition-colors"
            title="GitHub"
          >
            <GithubIcon className="w-4 h-4" />
          </a>
        </div>
      </div>
    </aside>
  );
}

