"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Search,
  Layers,
  Flame,
  CheckCircle2,
  Terminal,
  Loader2,
  ExternalLink,
  Bot,
  Cpu,
  Zap,
} from "lucide-react";
import { AIExplanationResult } from "@/lib/ai/explainer";

export default function AIExplainerStudioPage() {
  const [inputUrl, setInputUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    repoInfo: { owner: string; name: string; stars: number; language: string };
    explanation: AIExplanationResult;
  } | null>(null);

  const sampleRepos = [
    "vllm-project/vllm",
    "run-llama/llama_index",
    "karpathy/nanoGPT",
    "QwenLM/Qwen",
  ];

  const handleAnalyze = async (targetRepo?: string) => {
    const raw = (targetRepo || inputUrl).trim();
    if (!raw) return;

    let clean = raw.replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, "");
    const parts = clean.split("/");
    if (parts.length < 2) {
      setError("Please enter a valid repository format like 'owner/repository'.");
      return;
    }

    const owner = parts[0];
    const name = parts[1];

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const repoRes = await fetch(`/api/github/repo?owner=${owner}&name=${name}`);
      const repoData = await repoRes.json();
      if (!repoRes.ok || !repoData.success) {
        throw new Error(repoData.error || "Could not retrieve repository from GitHub.");
      }

      const repo = repoData.repo;

      const aiRes = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: repo.owner.login,
          name: repo.name,
          description: repo.description,
          language: repo.language,
          topics: repo.topics,
          stars: repo.stargazers_count,
        }),
      });

      const aiData = await aiRes.json();
      if (!aiRes.ok || !aiData.success) {
        throw new Error(aiData.error || "Failed to generate AI explanation.");
      }

      setResult({
        repoInfo: {
          owner: repo.owner.login,
          name: repo.name,
          stars: repo.stargazers_count,
          language: repo.language || "Unknown",
        },
        explanation: aiData.explanation,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-30 w-full bg-[#040711]/90 backdrop-blur-xl border-b border-white/[0.07] px-4 lg:px-8 pt-[max(2.75rem,calc(env(safe-area-inset-top)+0.75rem))] md:pt-3.5 pb-3">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="hidden sm:inline">AI Architecture Explainer Studio</span>
              <span className="sm:hidden">AI Explainer</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 lg:px-8 py-8 pb-28 md:pb-8 space-y-6">
        {/* Intro Card Bento */}
        <div className="p-6 sm:p-8 rounded-3xl bento-hero border border-purple-500/20 space-y-4 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold uppercase tracking-widest">
            <Bot className="w-4 h-4" />
            <span>AI Codebase Deconstruction Engine</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Deconstruct Any Open-Source Repository in Seconds
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-mono">
            Enter any public GitHub repository to synthesize architectural patterns,
            engineering trade-offs, trending catalysts, and real-world deployment use cases.
          </p>

          {/* Interactive Search Console */}
          <div className="pt-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAnalyze();
              }}
              className="flex flex-col sm:flex-row gap-2 max-w-2xl"
            >
              <div className="relative flex-1 group">
                <Terminal className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="text"
                  placeholder="e.g. meta-llama/llama-recipes or owner/repo"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#03060f]/90 text-xs sm:text-sm text-slate-100 placeholder-slate-500 rounded-xl border border-white/[0.08] focus:border-purple-500/60 focus:outline-none font-mono transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !inputUrl.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-mono font-bold tracking-wider uppercase transition-all disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-purple-950"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Codebase...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Audit</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Sample Chips */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-[11px] text-slate-500 font-mono">Quick audit:</span>
              {sampleRepos.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setInputUrl(s);
                    handleAnalyze(s);
                  }}
                  className="text-xs font-mono px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800 text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}

        {/* Results Container */}
        {result && (
          <div className="p-6 sm:p-8 rounded-3xl mnc-card space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <span>
                    {result.repoInfo.owner} / {result.repoInfo.name}
                  </span>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/60 font-bold">
                    {result.repoInfo.language}
                  </span>
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Validated against {result.repoInfo.stars.toLocaleString()} stargazers
                </p>
              </div>

              <Link
                href={`/repo/${result.repoInfo.owner}/${result.repoInfo.name}`}
                className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Full Repository Blueprint</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Overview */}
            <div className="p-4 rounded-2xl bg-[#03060f]/80 border border-white/[0.08] space-y-1.5">
              <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Plain-English Summary
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                {result.explanation.summary}
              </p>
            </div>

            {/* Why Trending */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-1.5">
              <div className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                Why Developers Are Adopting It
              </div>
              <p className="text-sm text-amber-200/90 leading-relaxed font-normal">
                {result.explanation.whyTrending}
              </p>
            </div>

            {/* Architecture Highlights */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-bold">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                Architectural Highlights
              </h4>
              <div className="space-y-2">
                {result.explanation.architectureHighlights.map((point, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs sm:text-sm text-slate-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Production Use Cases */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                Target Enterprise Use Cases
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {result.explanation.useCases.map((useCase, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-mono text-slate-300 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{useCase}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
