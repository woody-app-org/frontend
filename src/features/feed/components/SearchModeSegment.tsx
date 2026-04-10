import { cn } from "@/lib/utils";

export type SearchMode = "posts" | "people" | "communities";

const MODES: { id: SearchMode; label: string }[] = [
  { id: "posts", label: "Postagens" },
  { id: "people", label: "Pessoas" },
  { id: "communities", label: "Comunidades" },
];

/** gap-1 entre colunas; p-1 padding horizontal total 0.5rem; dois gaps = 0.5rem → colunas usam (100% - 1rem) / 3 */
const GAP_REM = "0.25rem";

const PILL_WIDTH = "calc((100% - 1rem) / 3)";

export interface SearchModeSegmentProps {
  value: SearchMode;
  onChange: (mode: SearchMode) => void;
  className?: string;
}

export function SearchModeSegment({ value, onChange, className }: SearchModeSegmentProps) {
  const activeIndex = Math.max(0, MODES.findIndex((m) => m.id === value));

  return (
    <div
      className={cn(
        "relative grid grid-cols-3 gap-1 p-1 rounded-full border border-[var(--woody-divider)] bg-[var(--woody-bg)] overflow-hidden",
        className
      )}
      role="tablist"
      aria-label="Modo de busca"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-1 left-1 rounded-full bg-[var(--woody-card)] shadow-[0_1px_2px_rgba(7,54,32,0.06)] border border-[var(--woody-divider)]/80 transition-transform duration-200 ease-out"
        style={{
          width: PILL_WIDTH,
          transform: `translateX(calc(${activeIndex} * (100% + ${GAP_REM})))`,
        }}
      />
      {MODES.map((mode) => {
        const isActive = value === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(mode.id)}
            className={cn(
              "relative z-10 flex min-w-0 items-center justify-center rounded-full px-2 sm:px-3 h-8 text-xs sm:text-sm font-medium transition-colors duration-200",
              isActive
                ? "text-[var(--woody-nav)]"
                : "text-[var(--woody-muted)] hover:bg-[var(--woody-nav)]/6 hover:text-[var(--woody-text)]"
            )}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
