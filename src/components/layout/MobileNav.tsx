"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Bookmark, Sparkles, Shield } from "lucide-react";
import { useBookmarks } from "@/context/BookmarkContext";

export function MobileNav() {
  const pathname = usePathname();
  const { bookmarks } = useBookmarks();

  const items = [
    {
      label: "Trending",
      href: "/",
      icon: Compass,
    },
    {
      label: "Bookmarks",
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
      label: "Auth",
      href: "/auth-status",
      icon: Shield,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#070b14]/90 backdrop-blur-xl border-t border-slate-800/80 px-4 py-2 pb-safe">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
                isActive
                  ? "text-cyan-400 font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "text-cyan-400 scale-110" : ""}`} />
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 text-[9px] font-mono px-1 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center">
                    {item.count}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-cyan-400 mt-0.5"></span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

