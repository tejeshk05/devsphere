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
  Terminal,
  Cpu,
  Zap,
  Radio,
  ExternalLink,
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
      label: "Discovery Grid",
      href: "/",
      icon: Compass,
      indicator: "LIVE",
    },
    {
      label: "Saved Vault",
      href: "/bookmarks",
      icon: Bookmark,
      count: bookmarks.length,
    },
    {
      label: "AI Intelligence",
      href: "/ai-explainer",
      icon: Sparkles,
      tag: "GEN 2.5",
    },
    {
      label: "Security Center",
      href: "/auth-status",
      icon: ShieldCheck,
      status: "SECURE",
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-[#050813]/90 backdrop-blur-2xl border-r border-white/[0.08] z-40 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-emerald-400 p-[1.5px] shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/50 transition-all duration-300">
            <div className="w-full h-full bg-[#050813] rounded-xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors" />
              <Layers className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                DevSphere
              </span>
              <span className="text-[9px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 font-bold">
                ENTERPRISE
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">Personal AI Discovery</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation Items */}
      <div className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto no-scrollbar">
        <div className="px-3 pb-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-500">
          <span>Command Center</span>
          <span className="text-cyan-500 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            V1.0
          </span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 relative ${
                isActive
                  ? "bg-gradient-to-r from-cyan-950/50 via-slate-900 to-transparent text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-950/40"
                  : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-400 rounded-r-full shadow-[0_0_8px_#00f0ff]" />
              )}

              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
                <span className="tracking-tight">{item.label}</span>
              </div>

              {item.indicator && (
                <span className="text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                  {item.indicator}
                </span>
              )}

              {item.count !== undefined && item.count > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800/90 border border-slate-700 text-amber-300 font-semibold shadow-inner">
                  {item.count}
                </span>
              )}

              {item.tag && (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-700/60 text-purple-300">
                  {item.tag}
                </span>
              )}
            </Link>
          );
        })}

        {/* Live Intelligence Channels */}
        <div className="pt-6 px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>AI Focus Channels</span>
          <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
        </div>

        <div className="space-y-1 px-1 text-xs">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-slate-400 hover:bg-white/[0.02] cursor-default">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
              <span>Agents & Reasoning</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400">HOT</span>
          </div>

          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-slate-400 hover:bg-white/[0.02] cursor-default">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_#a855f7]" />
              <span>LLM Runtimes</span>
            </span>
            <span className="text-[10px] font-mono text-purple-400">20k+</span>
          </div>

          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-slate-400 hover:bg-white/[0.02] cursor-default">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
              <span>Vision & Diffusion</span>
            </span>
            <span className="text-[10px] font-mono text-cyan-400">MODELS</span>
          </div>
        </div>
      </div>

      {/* Telemetry & System Status Console */}
      <div className="p-3 mx-3 mb-3 rounded-2xl bg-[#090e1c]/80 border border-white/[0.06] space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            GitHub Ingestion
          </span>
          <span className="text-emerald-400 font-semibold">ONLINE</span>
        </div>
        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/[0.05]">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 w-full animate-pulse" />
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>Latency: ~48ms</span>
          <span>Sync: Realtime</span>
        </div>
      </div>

      {/* Owner Clearance Profile Badge */}
      <div className="p-3 border-t border-white/[0.06] bg-[#03060d]">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold shadow-inner">
              TK
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-xs font-semibold text-slate-200 truncate">Tejesh Kumar</p>
                <Zap className="w-3 h-3 text-cyan-400 fill-cyan-400" />
              </div>
              <p className="text-[9px] font-mono text-cyan-400/90 tracking-wider">LEVEL-4 OWNER</p>
            </div>
          </div>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="GitHub Profile"
          >
            <GithubIcon className="w-4 h-4" />
          </a>
        </div>
      </div>
    </aside>
  );
}
