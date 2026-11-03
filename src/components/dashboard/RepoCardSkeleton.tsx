import React from "react";

export function RepoCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800/60 animate-pulse flex flex-col justify-between">
      <div>
        {/* Top Header Skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800" />
            <div className="w-24 h-3 bg-slate-800 rounded" />
          </div>
          <div className="flex gap-1.5">
            <div className="w-7 h-7 bg-slate-800 rounded-lg" />
            <div className="w-7 h-7 bg-slate-800 rounded-lg" />
          </div>
        </div>

        {/* Title & Description Skeleton */}
        <div className="w-3/4 h-5 bg-slate-800 rounded mb-3" />
        <div className="w-full h-3 bg-slate-800/80 rounded mb-2" />
        <div className="w-4/5 h-3 bg-slate-800/80 rounded mb-4" />

        {/* Badges Skeleton */}
        <div className="flex gap-2 mb-4">
          <div className="w-14 h-4 bg-slate-800/70 rounded" />
          <div className="w-16 h-4 bg-slate-800/70 rounded" />
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
        <div className="w-20 h-3 bg-slate-800 rounded" />
        <div className="flex gap-3">
          <div className="w-10 h-3 bg-slate-800 rounded" />
          <div className="w-10 h-3 bg-slate-800 rounded" />
        </div>
      </div>
    </div>
  );
}

