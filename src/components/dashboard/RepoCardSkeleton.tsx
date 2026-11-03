import React from "react";

export function RepoCardSkeleton() {
  return (
    <div className="mnc-card rounded-2xl p-5 animate-pulse flex flex-col justify-between min-h-[260px] relative overflow-hidden">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/[0.06]" />
            <div className="space-y-1.5">
              <div className="w-20 h-2.5 bg-white/[0.08] rounded" />
              <div className="w-14 h-2 bg-white/[0.04] rounded" />
            </div>
          </div>
          <div className="flex gap-1.5">
            <div className="w-7 h-7 bg-white/[0.05] rounded-xl" />
            <div className="w-7 h-7 bg-white/[0.05] rounded-xl" />
          </div>
        </div>

        {/* Title & Description */}
        <div className="w-3/4 h-5 bg-white/[0.08] rounded-lg mb-3" />
        <div className="w-full h-3 bg-white/[0.04] rounded mb-2" />
        <div className="w-4/5 h-3 bg-white/[0.04] rounded mb-4" />

        {/* Badges */}
        <div className="flex gap-1.5 mb-4">
          <div className="w-14 h-4 bg-white/[0.05] rounded-md" />
          <div className="w-16 h-4 bg-white/[0.05] rounded-md" />
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
        <div className="w-20 h-3 bg-white/[0.06] rounded" />
        <div className="flex gap-3">
          <div className="w-12 h-3 bg-white/[0.06] rounded" />
          <div className="w-10 h-3 bg-white/[0.06] rounded" />
        </div>
      </div>
    </div>
  );
}
