import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import type { BillingModality } from "../lib/planCatalog";

const OPTIONS: { id: BillingModality; label: string }[] = [
  { id: "monthly", label: "Mensal" },
  { id: "annual", label: "Anual" },
  { id: "upfront", label: "À vista" },
];

export interface BillingModalityToggleProps {
  value: BillingModality;
  onChange: (next: BillingModality) => void;
  className?: string;
  "aria-labelledby"?: string;
}

/**
 * Seletor de modalidade de pagamento (Mensal / Anual / À vista) para planos pagos.
 */
export function BillingModalityToggle({
  value,
  onChange,
  className,
  "aria-labelledby": ariaLabelledBy,
}: BillingModalityToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabelledBy ? undefined : "Modalidade de pagamento"}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        "mx-auto flex w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--woody-accent)]/16",
        "bg-[var(--woody-bg)]/80 p-1 shadow-[0_1px_3px_rgba(10,10,10,0.04)] sm:mx-0 sm:max-w-md",
        className
      )}
    >
      {OPTIONS.map((opt) => {
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={0}
            onClick={() => onChange(opt.id)}
            className={cn(
              woodyFocus.ring,
              "relative min-w-0 flex-1 rounded-xl px-2 py-2.5 text-center text-[0.8125rem] font-semibold transition-colors duration-200 sm:px-3 sm:text-sm",
              selected
                ? "bg-[var(--woody-card)] text-[var(--woody-text)] shadow-[0_1px_6px_rgba(10,10,10,0.06)] ring-1 ring-[var(--woody-nav)]/25"
                : "text-[var(--woody-muted)] hover:bg-black/[0.03] hover:text-[var(--woody-text)]"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
