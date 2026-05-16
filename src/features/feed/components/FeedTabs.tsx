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
 * Tabs do feed — ativa: fundo claro, texto reforçado e traço inferior na marca (sem bloco preto).
 */
export function FeedTabs({ activeFilter, onFilterChange, className }: FeedTabsProps) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 items-end gap-0 border-b border-black/[0.08] bg-[#ebebed]",
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
              "relative min-w-0 flex-1 px-2 py-3 text-center text-[0.8125rem] transition-[color,background-color,box-shadow] duration-200 sm:px-5 sm:py-3.5 sm:text-[0.9375rem]",
              "rounded-t-[0.875rem] md:rounded-t-xl",
              woodyFocus.ring,
              selected
                ? "z-[1] mb-[-1px] bg-white font-semibold text-[var(--woody-text)] shadow-[inset_0_-2px_0_0_var(--woody-nav)]"
                : "mb-0 font-medium text-[var(--woody-muted)] hover:bg-black/[0.03] hover:text-[var(--woody-text)]"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
