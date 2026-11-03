"use client";

import React from "react";
import { TIME_FILTERS } from "@/lib/constants";
import { TimeFilter } from "@/types/github";
import { Calendar, Flame } from "lucide-react";

interface TimeframeSelectorProps {
  selectedTimeframe: TimeFilter;
  onSelectTimeframe: (timeframe: TimeFilter) => void;
}

export function TimeframeSelector({
  selectedTimeframe,
  onSelectTimeframe,
}: TimeframeSelectorProps) {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-xl">
      <div className="hidden sm:flex items-center gap-1.5 px-2 text-xs text-slate-400 font-mono">
        <Flame className="w-3.5 h-3.5 text-amber-400" />
        <span>Trending:</span>
      </div>

      {TIME_FILTERS.map((filter) => {
        const isSelected = selectedTimeframe === filter.id;

        return (
          <button
            key={filter.id}
            onClick={() => onSelectTimeframe(filter.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isSelected
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
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

