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
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-[#080c14]/80 backdrop-blur-md border-b border-slate-800/60 px-4 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Security & Owner Authentication</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Private Instance Active</h2>
                <p className="text-xs text-slate-400 font-mono">
                  Owner Account: {authData?.ownerAccount || "Authorized Account"}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs font-semibold text-rose-300 hover:bg-rose-900/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>End Secure Session</span>
            </button>
          </div>

          {/* Security Features Overview */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider">
              Protected Architecture Safeguards
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <strong className="block text-white font-medium mb-0.5">
                    Server-Side Secrets
                  </strong>
                  All GitHub and AI API tokens remain strictly encrypted on the server.
                  Zero secrets exposed in browser bundles.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <strong className="block text-white font-medium mb-0.5">
                    Edge Middleware Guard
                  </strong>
                  Unauthorized web visitors and bots are halted before route rendering.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <strong className="block text-white font-medium mb-0.5">
                    HTTP-Only Session Cookie
                  </strong>
                  Session tokens cannot be accessed or intercepted via client JavaScript (XSS
                  resilient).
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <strong className="block text-white font-medium mb-0.5">
                    PWA Offline Storage
                  </strong>
                  Bookmarks and UI cache are stored locally in the browser sandbox.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

