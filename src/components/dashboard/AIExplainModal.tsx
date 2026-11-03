"use client";

import React, { useEffect, useState } from "react";
import { GitHubRepo } from "@/types/github";
import { AIExplanationResult } from "@/lib/ai/explainer";
import {
  Sparkles,
  X,
  Layers,
  Flame,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Copy,
  Check,
  Terminal,
  Cpu,
  ShieldAlert,
  Zap,
} from "lucide-react";

interface AIExplainModalProps {
  repo: GitHubRepo | null;
  onClose: () => void;
}

export function AIExplainModal({ repo, onClose }: AIExplainModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AIExplanationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "architecture" | "usecases">("summary");

  useEffect(() => {
    if (!repo) {
      setData(null);
      setError(null);
      return;
    }

    let isCancelled = false;
    async function loadExplanation() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/ai/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            owner: repo!.owner.login,
            name: repo!.name,
            description: repo!.description,
            language: repo!.language,
            topics: repo!.topics,
            stars: repo!.stargazers_count,
          }),
        });

        const json = await res.json();
        if (!isCancelled) {
          if (json.success) {
            setData(json.explanation);
          } else {
            setError(json.error || "Failed to generate explanation");
          }
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "Network error");
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadExplanation();
    return () => {
      isCancelled = true;
    };
  }, [repo]);

  if (!repo) return null;

  const handleCopy = () => {
    if (!data) return;
    const text = `=== DevSphere AI Architecture Report ===\nRepository: ${repo.full_name}\n\nSummary:\n${data.summary}\n\nTrending Trigger:\n${data.whyTrending}\n\nKey Strengths:\n${data.architectureHighlights.join("\n- ")}\n`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#060a16] border border-white/[0.12] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#080d1e]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-[1.5px] shadow-lg shadow-purple-950">
              <div className="w-full h-full bg-[#060a16] rounded-2xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  {repo.name}
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-700/60 text-purple-300">
                  AI DECONSTRUCTION
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                @{repo.owner.login} • {repo.language || "Polyglot"} • {repo.stargazers_count.toLocaleString()} stars
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {data && (
              <button
                onClick={handleCopy}
                className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
                title="Copy Analysis Report"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-white/[0.06] bg-[#050813]">
          <button
            onClick={() => setActiveTab("summary")}
            className={`pb-2.5 text-xs font-mono font-medium border-b-2 transition-all ${
              activeTab === "summary"
                ? "border-cyan-400 text-cyan-300 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Executive Summary
          </button>
          <button
            onClick={() => setActiveTab("architecture")}
            className={`pb-2.5 text-xs font-mono font-medium border-b-2 transition-all ${
              activeTab === "architecture"
                ? "border-purple-400 text-purple-300 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Architecture Patterns
          </button>
          <button
            onClick={() => setActiveTab("usecases")}
            className={`pb-2.5 text-xs font-mono font-medium border-b-2 transition-all ${
              activeTab === "usecases"
                ? "border-emerald-400 text-emerald-300 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Production Use Cases
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-200">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                <Sparkles className="w-4 h-4 text-purple-400 absolute inset-0 m-auto" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white tracking-tight">
                  Running Neural Architecture Evaluation...
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  Synthesizing code design patterns, AST signals & repository velocity
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-800/80 text-rose-300 text-sm font-mono space-y-2">
              <div className="font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Analysis Pipeline Exception
              </div>
              <p className="text-xs">{error}</p>
            </div>
          ) : data ? (
            <>
              {activeTab === "summary" && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 rounded-2xl bg-[#0a1024] border border-white/[0.08] space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      Core Engineering Thesis
                    </span>
                    <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal">
                      {data.summary}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5" />
                      Trending Adoption Catalyst
                    </span>
                    <p className="text-sm text-amber-200/90 leading-relaxed font-normal">
                      {data.whyTrending}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "architecture" && (
                <div className="space-y-3 animate-in fade-in">
                  <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    Key Architectural Pillars
                  </h4>
                  <div className="space-y-2.5">
                    {data.architectureHighlights.map((point, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs sm:text-sm text-slate-200"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "usecases" && (
                <div className="space-y-3 animate-in fade-in">
                  <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    Target Production Scenarios
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    {data.useCases.map((useCase, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs sm:text-sm text-slate-200 flex items-center gap-2.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{useCase}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#040711] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-[11px] font-mono text-slate-400">
              Engine: {data?.generatedWith === "gemini" ? "Google Gemini 2.5 Flash" : "Heuristic Code Matrix"}
            </span>
          </div>

          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-mono font-medium transition-colors"
          >
            <span>Inspect GitHub Source</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
