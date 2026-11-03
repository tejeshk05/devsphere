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
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
        {CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.iconName] || Brain;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-200 border shrink-0 ${
                isSelected
                  ? "bg-slate-800 text-white border-cyan-400/50 shadow-md shadow-cyan-950/40"
                  : "bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:bg-slate-850 hover:border-slate-700"
              }`}
              style={{
                borderColor: isSelected ? cat.accentColor : undefined,
              }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  backgroundColor: cat.accentColor,
                  boxShadow: isSelected ? `0 0 8px ${cat.accentColor}` : "none",
                }}
              />
              <Icon
                className={`w-3.5 h-3.5 shrink-0 ${
                  isSelected ? "text-white" : "text-slate-400"
                }`}
              />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

