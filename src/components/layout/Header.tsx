"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  Download,
  Layers,
  ShieldCheck,
  Command,
  Flame,
  Radio,
  Zap,
} from "lucide-react";

interface HeaderProps {
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}

export function Header({ onSearchChange, searchQuery = "" }: HeaderProps) {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  React.useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setCanInstall(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#040711]/85 backdrop-blur-xl border-b border-white/[0.07] px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Mobile Brand (When Sidebar is hidden) */}
        <div className="flex items-center gap-2.5 md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-[1.5px] shadow-sm shadow-cyan-500/30">
              <div className="w-full h-full bg-[#050813] rounded-xl flex items-center justify-center">
                <Layers className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white">
              DevSphere
            </span>
          </Link>
        </div>

        {/* Global Omnibox Command Bar */}
        <div className="flex-1 max-w-lg relative group">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-400 transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Search AI repositories, LLMs, agents, architectures..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full pl-10 pr-16 py-2 bg-[#090e1c]/80 text-xs text-slate-100 placeholder-slate-400 rounded-xl border border-white/[0.08] focus:border-cyan-500/60 focus:bg-[#0c1324] focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all font-mono"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery ? (
              <button
                onClick={() => onSearchChange?.("")}
                className="text-[10px] font-mono text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800"
              >
                ESC
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700/60 rounded">
                <Command className="w-2.5 h-2.5" /> K
              </kbd>
            )}
          </div>
        </div>

        {/* Global Quick Action Pills */}
        <div className="flex items-center gap-2.5">
          {/* PWA Mobile Installation Trigger */}
          {canInstall && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold hover:border-cyan-400 transition-all shadow-sm"
              title="Install DevSphere PWA App"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
              <span className="hidden sm:inline">Install Native App</span>
            </button>
          )}

          {/* AI Explainer Studio Trigger */}
          <Link
            href="/ai-explainer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800/50 text-purple-300 text-xs font-medium hover:bg-purple-900/50 hover:border-purple-600 transition-all shadow-sm shadow-purple-950/40"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Studio</span>
          </Link>

          {/* Security Status Guard Badge */}
          <Link
            href="/auth-status"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono text-emerald-400 hover:border-emerald-500/40 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden md:inline">VAULT ACTIVE</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
