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
    const text = `DevSphere AI Insight for ${repo.full_name}:\n\nSummary:\n${data.summary}\n\nWhy It's Trending:\n${data.whyTrending}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#090e18] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{repo.name}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-800/40 text-purple-300">
                  AI Architecture Insight
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {repo.owner.login} / {repo.language || "Multi-language"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {data && (
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Copy Insight"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-200">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="text-sm font-medium text-slate-300">
                Analyzing repository architecture & code signals...
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Extracting technical patterns, dependencies & trending indicators
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm">
              {error}
            </div>
          ) : data ? (
            <>
              {/* Executive Summary */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs font-mono uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  Plain-English Overview
                </div>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                  {data.summary}
                </p>
              </div>

              {/* Why It's Trending */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40">
                <div className="text-xs font-mono uppercase text-amber-400 mb-1.5 flex items-center gap-1.5 font-semibold">
                  <Flame className="w-3.5 h-3.5" />
                  Why It Is Trending
                </div>
                <p className="text-sm text-amber-200/90 leading-relaxed">
                  {data.whyTrending}
                </p>
              </div>

              {/* Architecture Highlights */}
              <div>
                <h4 className="text-xs font-mono uppercase text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  Key Architectural Strengths
                </h4>
                <div className="space-y-2">
                  {data.architectureHighlights.map((point, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 text-xs sm:text-sm text-slate-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Developer Use Cases */}
              {data.useCases && data.useCases.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono uppercase text-slate-400 mb-2.5">
                    Target Developer Use Cases
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {data.useCases.map((useCase, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-900/30 border border-slate-800/80 text-xs text-slate-300"
                      >
                        • {useCase}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#070b13] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span className="text-[11px] font-mono text-slate-400">
              DevSphere AI Engine: {data?.generatedWith || "ready"}
            </span>
          </div>

          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
          >
            <span>Open Repository</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

