"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Key,
  Lock,
  ArrowRight,
  Layers,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const [accessKey, setAccessKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessKey.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", accessKey: accessKey.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed. Incorrect access key.");
      }

      // Successfully authenticated
      router.push(from);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Brand Icon & Heading */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 p-[1.5px] shadow-lg shadow-cyan-500/20">
          <div className="w-full h-full bg-[#080c14] rounded-2xl flex items-center justify-center">
            <Layers className="w-7 h-7 text-cyan-400" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            <span>DevSphere</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
              PRO
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Private AI & Open-Source Repository Discovery Platform
          </p>
        </div>
      </div>

      {/* Security Banner */}
      <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white block font-medium">Authorized Owner Access</strong>
          This deployment is private. Enter your personal secret access key configured in{" "}
          <code className="text-cyan-300 font-mono">.env.local</code>.
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Personal Access Key</span>
            <span className="text-[10px] text-slate-400">Owner Secret</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter personal access key..."
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-10 py-3 bg-slate-950/90 text-sm text-slate-100 placeholder-slate-400 rounded-xl border border-slate-800 focus:border-cyan-500 focus:outline-none font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !accessKey.trim()}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-cyan-950"
        >
          {loading ? (
            <span>Authenticating Session...</span>
          ) : (
            <>
              <span>Unlock DevSphere</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Quick Hint / Dev helper */}
      <div className="pt-2 text-center border-t border-slate-800/60">
        <p className="text-[11px] text-slate-400">
          Default local key:{" "}
          <code className="text-slate-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
            devsphere-master-key-2026
          </code>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <Suspense
        fallback={
          <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            <span>Loading authentication vault...</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}

