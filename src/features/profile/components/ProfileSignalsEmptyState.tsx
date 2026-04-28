import { Heart } from "lucide-react";

export function ProfileSignalsEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--woody-divider)] bg-[var(--woody-card)]/82 px-5 py-10 text-center shadow-[0_1px_3px_rgba(10,10,10,0.04)]">
      <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-2xl bg-[var(--woody-tag-bg)] text-[var(--woody-nav)]">
        <Heart className="size-5" aria-hidden />
      </div>
      <h3 className="text-sm font-semibold text-[var(--woody-text)]">Nenhum sinal recebido ainda.</h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-[var(--woody-muted)]">
        Quando alguém demonstrar interesse, aparece aqui.
      </p>
    </div>
  );
}
