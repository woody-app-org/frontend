import { Globe, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { woodySurface } from "@/lib/woody-ui";
import type { Community } from "@/domain/types";
import { getCommunityCategoryLabel } from "../lib/communitiesPageModel";

export interface CommunityInfoPanelProps {
  community: Community;
  className?: string;
}

const panel = cn(woodySurface.card, "p-4 sm:p-5");

const RULE_ITEMS = [
  "Respeito e escuta ativa: este espaço é para mulheres se sentirem seguras para falar.",
  "Sem assédio, ódio ou exposição de terceiros — denúncias são levadas a sério.",
  "Conteúdo sensível deve vir com aviso; moderadoras podem ajustar ou remover postagens.",
] as const;

export function CommunityInfoPanel({ community, className }: CommunityInfoPanelProps) {
  const categoryLabel = getCommunityCategoryLabel(community.category);
  const customRuleLines = community.rules
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const ruleLines = customRuleLines.length > 0 ? customRuleLines : [...RULE_ITEMS];

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <section className={panel} aria-labelledby="community-about-heading">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-[var(--woody-nav)]" aria-hidden />
          <div className="min-w-0">
            <h2 id="community-about-heading" className="text-sm font-bold text-[var(--woody-text)]">
              Sobre este espaço
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--woody-text)]/90">
              {community.description}
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--woody-muted)]">
              <span>
                Categoria: <span className="font-semibold text-[var(--woody-text)]">{categoryLabel}</span>
              </span>
              {community.visibility === "private" ? (
                <span className="inline-flex items-center gap-1 font-medium text-[var(--woody-text)]">
                  <Lock className="size-3.5 opacity-80" aria-hidden />
                  Privada — entradas podem exigir aprovação
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-medium text-[var(--woody-text)]">
                  <Globe className="size-3.5 opacity-80" aria-hidden />
                  Pública
                </span>
              )}
            </p>
          </div>
        </div>
      </section>

      <section className={panel} aria-labelledby="community-rules-heading">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--woody-accent)]" aria-hidden />
          <div className="min-w-0">
            <h2 id="community-rules-heading" className="text-sm font-bold text-[var(--woody-text)]">
              {customRuleLines.length > 0 ? "Regras desta comunidade" : "Ambiente seguro"}
            </h2>
            {customRuleLines.length === 0 ? (
              <p className="mt-2 text-xs text-[var(--woody-muted)] leading-relaxed">
                Diretrizes gerais da plataforma abaixo. A moderadora pode definir regras próprias em{" "}
                <strong className="text-[var(--woody-text)]">Gerenciar comunidade</strong>.
              </p>
            ) : null}
            <ul className="mt-3 list-none space-y-2.5 p-0 m-0">
              {ruleLines.map((item, index) => (
                <li
                  key={`rule-${index}-${item.slice(0, 12)}`}
                  className="relative pl-3 text-sm leading-relaxed text-[var(--woody-text)]/88 before:absolute before:left-0 before:top-2 before:size-1 before:rounded-full before:bg-[var(--woody-nav)]/40"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
