import { cn } from "@/lib/utils";
import { woodySurface } from "@/lib/woody-ui";
import { Sparkles } from "lucide-react";

export function ProfileSignalsEmptyState() {
  return (
    <div
      className={cn(
        woodySurface.emptyDashed,
        "relative overflow-hidden px-5 py-12 text-center",
        "shadow-[0_1px_3px_rgba(10,10,10,0.04)]"
      )}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 size-28 rounded-full bg-[var(--woody-nav)]/[0.07]"
        aria-hidden
      />
      <div className="relative mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-[var(--woody-tag-bg)] text-[var(--woody-nav)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
        <Sparkles className="size-6" aria-hidden />
      </div>
      <h3 className="text-sm font-semibold text-[var(--woody-text)]">Nenhum sinal recebido ainda</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--woody-muted)]">
        Quando alguém demonstrar interesse, aparece aqui — só tu vês.
      </p>
    </div>
  );
}
