import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import type { FeedFilter } from "../types";

const TABS: { id: FeedFilter; label: string }[] = [
  { id: "trending", label: "Em destaque" },
  { id: "forYou", label: "Para você" },
  { id: "following", label: "Seguindo" },
];

export interface FeedTabsProps {
  activeFilter: FeedFilter;
  onFilterChange: (filter: FeedFilter) => void;
  className?: string;
}

/**
 * Tabs do feed — barra com peso editorial; ativa: fundo preto, cantos superiores arredondados, barra verde inferior grossa.
 */
export function FeedTabs({ activeFilter, onFilterChange, className }: FeedTabsProps) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 items-end gap-0 border-b-2 border-black/[0.08] bg-[#ebebed]",
        className
      )}
      role="tablist"
      aria-label="Filtros do feed"
    >
      {TABS.map((tab) => {
        const selected = activeFilter === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onFilterChange(tab.id)}
            role="tab"
            aria-selected={selected}
            className={cn(
              "relative min-w-0 flex-1 px-2 py-3 text-center text-[0.8125rem] transition-[color,background,box-shadow] duration-200 sm:px-5 sm:py-3.5 sm:text-[0.9375rem]",
              "rounded-t-[0.875rem] md:rounded-t-xl",
              woodyFocus.ring,
              selected
                ? "z-[1] mb-[-2px] bg-[var(--woody-ink)] font-semibold text-white shadow-[inset_0_-5px_0_0_var(--woody-nav)]"
                : "mb-0 font-medium text-[var(--woody-text)]/50 hover:text-[var(--woody-text)]/88"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
