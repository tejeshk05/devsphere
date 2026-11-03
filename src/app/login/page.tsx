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
  Terminal,
  Cpu,
  Radio,
  Fingerprint,
  Zap,
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
        throw new Error(data.error || "Authentication denied. Invalid clearance key.");
      }

      router.push(from);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md mnc-card rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-3xl border border-white/[0.12] space-y-6 overflow-hidden">
      {/* Top Hairline Ambient Beam */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00f0ff]" />

      {/* Brand & Security Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-emerald-400 p-[1.5px] shadow-xl shadow-cyan-500/25">
          <div className="w-full h-full bg-[#050813] rounded-2xl flex items-center justify-center">
            <Layers className="w-7 h-7 text-cyan-400" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">DevSphere</h1>
            <span className="text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700/60 text-cyan-300">
              VAULT
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Personal AI & Open-Source Discovery Platform
          </p>
        </div>
      </div>

      {/* Security Clearance Alert Strip */}
      <div className="p-3.5 rounded-2xl bg-[#090f20]/90 border border-cyan-500/20 flex items-start gap-3 shadow-inner">
        <Fingerprint className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed font-mono">
          <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold mb-0.5">
            <span>CLEARANCE: LEVEL-4 OWNER</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SHIELD ON
            </span>
          </div>
          Private deployment protected by server session authentication. Enter your master
          key configured in <code className="text-cyan-300">.env.local</code>.
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/80 text-xs font-mono text-rose-300 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              Master Access Key
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Owner Secret</span>
          </label>

          <div className="relative group">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter master personal key..."
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-10 py-3 bg-[#03060f]/90 text-sm text-slate-100 placeholder-slate-500 rounded-xl border border-white/[0.08] focus:border-cyan-500 focus:bg-[#060c1d] focus:ring-2 focus:ring-cyan-500/20 focus:outline-none font-mono transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !accessKey.trim()}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs font-mono uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/60"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Verifying Cryptographic Session...</span>
            </>
          ) : (
            <>
              <span>Authorize & Unlock Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Telemetry Footer */}
      <div className="pt-2 border-t border-white/[0.06] text-center space-y-2">
        <div className="flex items-center justify-center gap-3 text-[10px] font-mono text-slate-400 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            TLS 1.3 Strict
          </span>
          <span>•</span>
          <span>HMAC Session Guard</span>
          <span>•</span>
          <span>Zero Client Leakage</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#03050c] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* High-tech Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <Suspense
        fallback={
          <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2 font-mono text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Establishing Secure Handshake...</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
