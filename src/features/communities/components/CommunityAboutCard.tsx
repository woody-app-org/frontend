import { Globe, Lock, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { woodySurface } from "@/lib/woody-ui";
import type { Community } from "@/domain/types";
import { getCommunityCategoryLabel } from "../lib/communitiesPageModel";

export interface CommunityAboutCardProps {
  community: Community;
  memberCount: number;
  className?: string;
}

const panel = cn(woodySurface.card, "overflow-visible p-4 sm:p-5");

function formatMemberCountLine(n: number): string {
  if (n >= 10000) return `${Math.round(n / 1000)} mil membros`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")} mil membros`;
  return `${n} ${n === 1 ? "membro" : "membros"}`;
}

/** Lateral: resumo completo e metadados, com quebra de linha — sem truncar com reticências. */
export function CommunityAboutCard({ community, memberCount, className }: CommunityAboutCardProps) {
  const categoryLabel = getCommunityCategoryLabel(community.category);
  const hasDescription = community.description.trim().length > 0;

  return (
    <section className={cn(panel, className)} aria-labelledby="community-about-heading">
      <div className="flex min-w-0 items-start gap-2.5">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-[var(--woody-nav)]" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 id="community-about-heading" className="text-sm font-bold text-[var(--woody-text)]">
            Sobre este espaço
          </h2>
          {hasDescription ? (
            <p className="mt-2 text-pretty break-words text-sm leading-relaxed text-[var(--woody-text)] [overflow-wrap:anywhere]">
              {community.description.trim()}
            </p>
          ) : (
            <p className="mt-2 break-words text-sm italic leading-relaxed text-[var(--woody-muted)]">
              Nenhuma descrição cadastrada ainda.
            </p>
          )}
          <ul className="mt-4 flex min-w-0 flex-col gap-3 border-t border-[var(--woody-accent)]/10 pt-4 text-xs text-[var(--woody-muted)]">
            <li>
              <span className="font-medium text-[var(--woody-text)]/80">Categoria </span>
              <span className="break-words font-semibold text-[var(--woody-text)]">{categoryLabel}</span>
            </li>
            <li className="flex min-w-0 items-start gap-2">
              <Users className="mt-0.5 size-3.5 shrink-0 opacity-80" aria-hidden />
              <span className="min-w-0 break-words">
                <span className="font-medium text-[var(--woody-text)]/80">Membros · </span>
                <span className="font-semibold text-[var(--woody-text)]">{formatMemberCountLine(memberCount)}</span>
              </span>
            </li>
            <li className="flex min-w-0 items-start gap-2">
              {community.visibility === "private" ? (
                <>
                  <Lock className="mt-0.5 size-3.5 shrink-0 opacity-80" aria-hidden />
                  <p className="min-w-0 flex-1 break-words leading-snug">
                    <span className="font-medium text-[var(--woody-text)]/80">Visibilidade · </span>
                    <span className="font-semibold text-[var(--woody-text)]">Privada.</span>{" "}
                    <span className="text-[var(--woody-muted)]">Novas entradas podem precisar de aprovação.</span>
                  </p>
                </>
              ) : (
                <>
                  <Globe className="mt-0.5 size-3.5 shrink-0 opacity-80" aria-hidden />
                  <p className="min-w-0 flex-1 break-words leading-snug">
                    <span className="font-medium text-[var(--woody-text)]/80">Visibilidade · </span>
                    <span className="font-semibold text-[var(--woody-text)]">Pública.</span>{" "}
                    <span className="text-[var(--woody-muted)]">
                      Qualquer pessoa pode ver o espaço e solicitar participação.
                    </span>
                  </p>
                </>
              )}
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
