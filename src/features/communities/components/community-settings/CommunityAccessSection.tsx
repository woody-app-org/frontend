import { Globe, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import type { CommunityVisibility } from "@/domain/types";

export interface CommunityAccessSectionProps {
  formId: string;
  visibility: CommunityVisibility;
  onVisibilityChange: (v: CommunityVisibility) => void;
}

export function CommunityAccessSection({
  formId,
  visibility,
  onVisibilityChange,
}: CommunityAccessSectionProps) {
  return (
    <section className="space-y-3" aria-labelledby={`${formId}-access`}>
      <h3 id={`${formId}-access`} className="text-sm font-semibold text-[var(--woody-text)]">
        Tipo de acesso
      </h3>
      <p className="text-xs text-[var(--woody-muted)] leading-relaxed">
        Define como novas pessoas entram. Em produção, entradas em comunidades privadas costumam passar por aprovação.
      </p>

      <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Visibilidade da comunidade">
        <button
          type="button"
          role="radio"
          aria-checked={visibility === "public"}
          onClick={() => onVisibilityChange("public")}
          className={cn(
            woodyFocus.ring,
            "flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-colors",
            visibility === "public"
              ? "border-[var(--woody-nav)] bg-[var(--woody-nav)]/10 ring-1 ring-[var(--woody-nav)]/25"
              : "border-[var(--woody-accent)]/20 bg-[var(--woody-bg)] hover:bg-[var(--woody-nav)]/5"
          )}
        >
          <Globe className="size-5 shrink-0 text-[var(--woody-nav)]" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-[var(--woody-text)]">Pública</p>
            <p className="mt-0.5 text-xs text-[var(--woody-muted)] leading-snug">
              Qualquer pessoa pode encontrar e participar mais rapidamente (conforme produto).
            </p>
          </div>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={visibility === "private"}
          onClick={() => onVisibilityChange("private")}
          className={cn(
            woodyFocus.ring,
            "flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-colors",
            visibility === "private"
              ? "border-[var(--woody-nav)] bg-[var(--woody-nav)]/10 ring-1 ring-[var(--woody-nav)]/25"
              : "border-[var(--woody-accent)]/20 bg-[var(--woody-bg)] hover:bg-[var(--woody-nav)]/5"
          )}
        >
          <Lock className="size-5 shrink-0 text-[var(--woody-accent)]" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-[var(--woody-text)]">Privada</p>
            <p className="mt-0.5 text-xs text-[var(--woody-muted)] leading-snug">
              Novas entradas podem exigir aprovação da moderadora — alinhado ao fluxo de pedidos (mock).
            </p>
          </div>
        </button>
      </div>
    </section>
  );
}
