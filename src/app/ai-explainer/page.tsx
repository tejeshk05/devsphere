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

    // Parse owner and repo name from input
    // Accepts formats: 'owner/repo', 'https://github.com/owner/repo'
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
      // 1. Fetch live repository details
      const repoRes = await fetch(`/api/github/repo?owner=${owner}&name=${name}`);
      const repoData = await repoRes.json();
      if (!repoRes.ok || !repoData.success) {
        throw new Error(repoData.error || "Could not retrieve repository from GitHub.");
      }

      const repo = repoData.repo;

      // 2. Fetch AI Explanation
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
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI Architecture Explainer Studio</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6">
        {/* Intro Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-purple-950/40 via-slate-900 to-cyan-950/40 border border-purple-900/40 space-y-3">
          <div className="flex items-center gap-2 text-purple-300 font-mono text-xs">
            <Bot className="w-4 h-4" />
            <span>Automated Code Intelligence Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Deconstruct Any Open-Source Codebase in Seconds
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Enter any public GitHub repository to extract plain-English summaries,
            architectural strengths, trending triggers, and practical enterprise use cases.
          </p>

          {/* Search / Input Box */}
          <div className="pt-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAnalyze();
              }}
              className="flex flex-col sm:flex-row gap-2 max-w-2xl"
            >
              <div className="relative flex-1">
                <Terminal className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. meta-llama/llama-recipes or owner/repo"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/90 text-sm text-slate-100 placeholder-slate-500 rounded-xl border border-slate-800 focus:border-purple-500 focus:outline-none font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !inputUrl.trim()}
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-purple-950"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Codebase</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Sample Chips */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs text-slate-500 font-mono">Try examples:</span>
              {sampleRepos.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setInputUrl(s);
                    handleAnalyze(s);
                  }}
                  className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-slate-700 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800 text-rose-300 text-sm">
            {error}
          </div>
        )}

        {/* Results view */}
        {result && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>
                    {result.repoInfo.owner} / {result.repoInfo.name}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                    {result.repoInfo.language}
                  </span>
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Backed by {result.repoInfo.stars.toLocaleString()} stargazers
                </p>
              </div>

              <Link
                href={`/repo/${result.repoInfo.owner}/${result.repoInfo.name}`}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>Full Repository Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Overview */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-xs font-mono uppercase text-cyan-400 mb-2 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Plain-English Summary
              </div>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                {result.explanation.summary}
              </p>
            </div>

            {/* Why It's Trending */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40">
              <div className="text-xs font-mono uppercase text-amber-400 mb-2 font-semibold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                Why Developers Are Adopting It
              </div>
              <p className="text-sm text-amber-200/90 leading-relaxed">
                {result.explanation.whyTrending}
              </p>
            </div>

            {/* Architecture Highlights */}
            <div>
              <h4 className="text-xs font-mono uppercase text-slate-400 mb-3 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                Architectural Highlights
              </h4>
              <div className="space-y-2">
                {result.explanation.architectureHighlights.map((point, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-sm text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Use Cases */}
            <div>
              <h4 className="text-xs font-mono uppercase text-slate-400 mb-3">
                Target Use Cases
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {result.explanation.useCases.map((useCase, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-300"
                  >
                    • {useCase}
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

