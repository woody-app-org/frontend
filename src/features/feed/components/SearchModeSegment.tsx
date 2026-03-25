import { cn } from "@/lib/utils";

export type SearchMode = "topics" | "people";

const MODES: { id: SearchMode; label: string }[] = [
  { id: "topics", label: "Tópicos" },
  { id: "people", label: "Pessoas" },
];

/** gap-1 = 0.25rem entre as duas colunas */
const GAP_REM = "0.25rem";

/**
 * Largura do pill: (100% da área do container) menos padding horizontal (p-1+p-1) e o gap entre colunas.
 * Evita overflow do indicador para fora do rounded-full.
 */
const PILL_WIDTH = "calc((100% - 0.75rem) / 2)";

export interface SearchModeSegmentProps {
  value: SearchMode;
  onChange: (mode: SearchMode) => void;
  className?: string;
}

/**
 * Segmento Tópicos / Pessoas (header): mesmo visual do design anterior (pill arredondado, fundo translúcido)
 * com indicador branco deslizante (sem sombra pesada que “duplica” o contorno).
 */
export function SearchModeSegment({ value, onChange, className }: SearchModeSegmentProps) {
  const activeIndex = Math.max(0, MODES.findIndex((m) => m.id === value));

  return (
    <div
      className={cn(
        "relative grid grid-cols-2 gap-1 p-1 rounded-full bg-white/10 border border-white/15 overflow-hidden",
        className
      )}
      role="tablist"
      aria-label="Modo de busca"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-1 left-1 rounded-full bg-white transition-transform duration-200 ease-out"
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
              "relative z-10 flex min-w-0 items-center justify-center rounded-full px-4 h-8 text-sm font-medium transition-colors duration-200",
              isActive
                ? "text-[var(--woody-header)]"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            )}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
