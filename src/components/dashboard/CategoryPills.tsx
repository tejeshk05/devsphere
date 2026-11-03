"use client";

import React from "react";
import { CATEGORIES } from "@/lib/constants";
import { CategoryId } from "@/types/github";
import {
  Brain,
  Cpu,
  Sparkles,
  MessageSquareCode,
  Bot,
  Database,
  Eye,
  Workflow,
} from "lucide-react";

interface CategoryPillsProps {
  selectedCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Brain,
  Cpu,
  Sparkles,
  MessageSquareCode,
  Bot,
  Database,
  Eye,
  Workflow,
};

export function CategoryPills({
  selectedCategory,
  onSelectCategory,
}: CategoryPillsProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth">
        {CATEGORIES.map((cat, idx) => {
          const Icon = ICON_MAP[cat.iconName] || Brain;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all duration-200 border shrink-0 relative overflow-hidden ${
                isSelected
                  ? "bg-[#0d1629] text-white border-cyan-400/60 shadow-lg shadow-cyan-950/60"
                  : "bg-[#070b16]/70 text-slate-400 border-white/[0.06] hover:text-slate-200 hover:bg-[#0c1222] hover:border-white/[0.12]"
              }`}
            >
              {isSelected && (
                <div
                  className="absolute inset-x-0 bottom-0 h-[2px]"
                  style={{
                    backgroundColor: cat.accentColor,
                    boxShadow: `0 0 10px ${cat.accentColor}`,
                  }}
                />
              )}

              <span
                className="w-1.5 h-1.5 rounded-full shrink-0 transition-transform group-hover:scale-125"
                style={{
                  backgroundColor: cat.accentColor,
                  boxShadow: isSelected ? `0 0 8px ${cat.accentColor}` : "none",
                }}
              />

              <Icon
                className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                  isSelected ? "text-cyan-300" : "text-slate-400 group-hover:text-slate-200"
                }`}
              />

              <span className="tracking-tight">{cat.label}</span>

              <span className="text-[10px] text-slate-500 font-mono">
                #{String(idx + 1).padStart(2, "0")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
