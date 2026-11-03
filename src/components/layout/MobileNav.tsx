"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Bookmark, Sparkles, ShieldCheck } from "lucide-react";
import { useBookmarks } from "@/context/BookmarkContext";

export function MobileNav() {
  const pathname = usePathname();
  const { bookmarks } = useBookmarks();

  // Hide mobile bottom navigation bar on login screen
  if (pathname === "/login") {
    return null;
  }

  const items = [
    {
      label: "Grid",
      href: "/",
      icon: Compass,
    },
    {
      label: "Vault",
      href: "/bookmarks",
      icon: Bookmark,
      count: bookmarks.length,
    },
    {
      label: "AI Studio",
      href: "/ai-explainer",
      icon: Sparkles,
    },
    {
      label: "Security",
      href: "/auth-status",
      icon: ShieldCheck,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-4 right-4 z-50">
      <div className="bg-[#050914]/90 backdrop-blur-2xl border border-white/[0.12] rounded-2xl px-3 py-2 shadow-2xl shadow-black/80 flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                isActive
                  ? "text-cyan-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? "scale-110 text-cyan-400" : ""
                  }`}
                />
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 text-[9px] font-mono px-1 rounded-full bg-cyan-400 text-slate-950 font-extrabold flex items-center justify-center shadow-md">
                    {item.count}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 font-mono uppercase">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-0.5 shadow-[0_0_6px_#00f0ff]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
