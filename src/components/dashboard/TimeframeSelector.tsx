"use client";

import React from "react";
import { TIME_FILTERS } from "@/lib/constants";
import { TimeFilter } from "@/types/github";
import { Flame, Clock } from "lucide-react";

interface TimeframeSelectorProps {
  selectedTimeframe: TimeFilter;
  onSelectTimeframe: (timeframe: TimeFilter) => void;
}

export function TimeframeSelector({
  selectedTimeframe,
  onSelectTimeframe,
}: TimeframeSelectorProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-[#070b16]/90 border border-white/[0.08] rounded-xl shadow-inner">
      <div className="hidden sm:flex items-center gap-1.5 px-2 text-[11px] text-slate-400 font-mono">
        <Flame className="w-3.5 h-3.5 text-amber-400" />
        <span>Window:</span>
      </div>

      {TIME_FILTERS.map((filter) => {
        const isSelected = selectedTimeframe === filter.id;

        return (
          <button
            key={filter.id}
            onClick={() => onSelectTimeframe(filter.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 relative ${
              isSelected
                ? "bg-gradient-to-r from-cyan-500/25 to-blue-600/25 text-cyan-300 border border-cyan-400/50 shadow-md shadow-cyan-950 font-bold"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent"
            }`}
            title={filter.period}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
