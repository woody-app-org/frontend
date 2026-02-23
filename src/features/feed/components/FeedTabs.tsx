import { cn } from "@/lib/utils";
import type { FeedFilter } from "../types";

const TABS: { id: FeedFilter; label: string }[] = [
  { id: "trending", label: "Em Alta" },
  { id: "forYou", label: "Para você" },
  { id: "following", label: "Seguindo" },
];

export interface FeedTabsProps {
  activeFilter: FeedFilter;
  onFilterChange: (filter: FeedFilter) => void;
  className?: string;
}

export function FeedTabs({ activeFilter, onFilterChange, className }: FeedTabsProps) {
  return (
    <div
      className={cn(
        "flex gap-2 p-2 rounded-lg bg-[var(--woody-bg)]",
        className
      )}
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onFilterChange(tab.id)}
          className={cn(
            "flex-1 min-w-0 py-2 px-3 rounded-md text-sm transition-colors",
            activeFilter === tab.id
              ? "bg-[var(--woody-nav)] text-white font-semibold"
              : "bg-transparent text-[var(--woody-text)] font-medium hover:bg-[var(--woody-nav)]/10"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
