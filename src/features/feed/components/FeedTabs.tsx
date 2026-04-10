import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
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
  const activeTabIndex = Math.max(
    0,
    TABS.findIndex((tab) => tab.id === activeFilter)
  );

  return (
    <div
      className={cn(
        "relative grid grid-cols-3 gap-1.5 p-1.5 rounded-xl border border-[var(--woody-accent)]/12 bg-[var(--woody-card)]/75 shadow-[0_1px_3px_rgba(7,54,32,0.05)]",
        className
      )}
      role="tablist"
      aria-label="Filtros do feed"
    >
      <span
        aria-hidden
        className="absolute inset-y-1.5 left-1.5 w-[calc((100%-0.75rem)/3)] rounded-lg bg-[var(--woody-nav)] shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${activeTabIndex * 100}%)` }}
      />
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onFilterChange(tab.id)}
          role="tab"
          aria-selected={activeFilter === tab.id}
          className={cn(
            "relative z-10 min-w-0 py-2.5 px-2 sm:px-3 rounded-lg text-sm transition-colors duration-200",
            woodyFocus.ring,
            activeFilter === tab.id
              ? "text-white font-semibold"
              : "bg-transparent text-[var(--woody-text)]/85 font-medium hover:text-[var(--woody-text)]"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
