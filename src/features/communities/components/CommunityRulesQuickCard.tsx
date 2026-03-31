import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { woodySurface } from "@/lib/woody-ui";
import type { Community } from "@/domain/types";

export interface CommunityRulesQuickCardProps {
  community: Community;
  className?: string;
}

const panel = cn(woodySurface.card, "p-4 sm:p-5");

const DEFAULT_RULES = [
  "Respeito e escuta ativa: este espaço é para mulheres se sentirem seguras para falar.",
  "Sem assédio, ódio ou exposição de terceiros — denúncias são levadas a sério.",
  "Conteúdo sensível deve vir com aviso; moderadoras podem ajustar ou remover postagens.",
] as const;

/**
 * Regras resumidas na lateral — texto longo não quebra layout (scroll suave).
 */
export function CommunityRulesQuickCard({ community, className }: CommunityRulesQuickCardProps) {
  const customLines = community.rules
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const ruleLines = customLines.length > 0 ? customLines : [...DEFAULT_RULES];

  return (
    <section className={cn(panel, className)} aria-labelledby="community-rules-quick-heading">
      <div className="flex items-start gap-2.5">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--woody-accent)]" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 id="community-rules-quick-heading" className="text-sm font-bold text-[var(--woody-text)]">
            Regras rápidas
          </h2>
          {customLines.length === 0 ? (
            <p className="mt-2 text-xs leading-relaxed text-[var(--woody-muted)]">
              Diretrizes gerais abaixo. Regras próprias do espaço podem ser definidas em{" "}
              <strong className="font-semibold text-[var(--woody-text)]">Editar comunidade</strong>.
            </p>
          ) : null}
          <div className="mt-3 max-h-52 overflow-y-auto overscroll-y-contain pr-1">
            <ul className="list-none space-y-2.5 p-0 m-0">
              {ruleLines.map((item, index) => (
                <li
                  key={`rule-${index}-${item.slice(0, 12)}`}
                  className="break-words pl-3 text-sm leading-relaxed text-[var(--woody-text)]/88 relative before:absolute before:left-0 before:top-2 before:size-1 before:rounded-full before:bg-[var(--woody-nav)]/40"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
