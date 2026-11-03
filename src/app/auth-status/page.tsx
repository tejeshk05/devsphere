"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ArrowLeft,
  LogOut,
  Key,
  Lock,
  Cpu,
  Layers,
  CheckCircle,
  Fingerprint,
  Radio,
  Zap,
} from "lucide-react";

export default function AuthStatusPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authData, setAuthData] = useState<{
    authenticated: boolean;
    ownerAccount: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/auth")
      .then((res) => res.json())
      .then((data) => setAuthData(data))
      .catch((err) => console.error(err));
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });

      // Purge Service Worker CacheStorage upon logout
      if (typeof window !== "undefined" && "caches" in window) {
        const cacheKeys = await window.caches.keys();
        await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
      }

      if (typeof window !== "undefined" && navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "CLEAR_AUTHENTICATED_CACHE",
        });
      }

      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-[#040711]/85 backdrop-blur-xl border-b border-white/[0.07] px-4 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Owner Security & Authorization Vault</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl mnc-card space-y-6 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-white/[0.08]">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-700/60 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/40">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-white">Owner Session Active</h2>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-300">
                    PROTECTED
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Authorized Identity: {authData?.ownerAccount || "D. Tejesh Kumar (Owner)"}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/40 border border-rose-800/80 text-xs font-mono font-bold text-rose-300 hover:bg-rose-900/50 transition-colors shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Terminate Session</span>
            </button>
          </div>

          {/* Security Features Overview */}
          <div className="space-y-3 font-mono">
            <h3 className="text-xs uppercase text-slate-400 tracking-wider font-bold">
              Production Cryptographic Guardrails
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-[#03060f]/80 border border-white/[0.08] flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <strong className="block text-white font-bold">
                    Zero Client Token Leakage
                  </strong>
                  All GitHub PATs and Gemini AI keys remain encrypted on the server environment.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#03060f]/80 border border-white/[0.08] flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <strong className="block text-white font-bold">
                    Edge Middleware Sentry
                  </strong>
                  Non-authenticated bots and public visitors are halted before page rendering.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#03060f]/80 border border-white/[0.08] flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <strong className="block text-white font-bold">
                    HTTP-Only Session Cookie
                  </strong>
                  Tamper-proof browser session cookie with lax SameSite policy and path scoping.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#03060f]/80 border border-white/[0.08] flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <strong className="block text-white font-bold">
                    Local Device Isolation
                  </strong>
                  Bookmarks and UI cache are persisted in browser sandboxed LocalStorage.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
