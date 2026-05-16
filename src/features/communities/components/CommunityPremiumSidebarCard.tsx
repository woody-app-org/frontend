import { Link } from "react-router-dom";
import { BarChart3, ChevronRight, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CommunityPremiumCapabilities } from "@/domain/types";
import { cn } from "@/lib/utils";
import { woodyFocus, woodySurface } from "@/lib/woody-ui";

export interface CommunityPremiumSidebarCardProps {
  capabilities: CommunityPremiumCapabilities | undefined;
  communitySlug: string;
  onOpenGrowth: () => void;
  onUpgrade: () => void | Promise<void>;
  upgradeBusy?: boolean;
}

/**
 * Cartão na coluna lateral (desktop e mobile — mesmo bloco no fluxo da página) para analytics/crescimento.
 */
export function CommunityPremiumSidebarCard({
  capabilities,
  communitySlug,
  onOpenGrowth,
  onUpgrade,
  upgradeBusy = false,
}: CommunityPremiumSidebarCardProps) {
  const staff = capabilities?.isStaffForPremiumTools ?? false;
  if (!staff) return null;

  const premium = capabilities?.communityPremiumActive ?? false;
  const canDashboard = Boolean(capabilities?.canAccessCommunityAnalytics);

  return (
    <section
      className={cn(
        woodySurface.card,
        "border-[var(--woody-accent)]/12 bg-[var(--woody-card)] p-5 shadow-sm md:p-6"
      )}
      aria-labelledby="community-premium-sidebar-heading"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2
            id="community-premium-sidebar-heading"
            className="text-sm font-bold tracking-tight text-[var(--woody-text)]"
          >
            Crescimento da comunidade
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--woody-muted)]">
            Analytics e impulsionar posts — ligados ao plano premium deste espaço (não ao Woody Pro da conta).
          </p>
        </div>
        <BarChart3 className="size-5 shrink-0 text-[var(--woody-nav)]/85" aria-hidden />
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {premium ? (
          <>
            <Button
              type="button"
              variant="outline"
              className={cn(woodyFocus.ring, "h-11 w-full justify-between border-[var(--woody-accent)]/22")}
              onClick={() => onOpenGrowth()}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <BarChart3 className="size-4 opacity-80" aria-hidden />
                Resumo e métricas rápidas
              </span>
              <ChevronRight className="size-4 opacity-60" aria-hidden />
            </Button>
            {canDashboard ? (
              <Button
                asChild
                variant="ghost"
                className={cn(woodyFocus.ring, "h-10 w-full text-sm font-medium text-[var(--woody-nav)]")}
              >
                <Link to={`/communities/${encodeURIComponent(communitySlug)}/admin`}>Painel completo de analytics</Link>
              </Button>
            ) : null}
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--woody-accent)]/25 bg-[var(--woody-bg)]/80 p-3">
            <div className="flex items-start gap-2">
              <Lock className="mt-0.5 size-4 shrink-0 text-[var(--woody-nav)]" aria-hidden />
              <p className="text-xs leading-relaxed text-[var(--woody-muted)]">
                Premium do espaço inactivo — subscreve (Stripe da comunidade) para desbloquear analytics e
                impulsionar publicações.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              className={cn(
                woodyFocus.ring,
                "mt-3 h-9 w-full gap-1.5 bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/92"
              )}
              disabled={upgradeBusy}
              onClick={() => void onUpgrade()}
            >
              <Sparkles className="size-3.5" aria-hidden />
              {upgradeBusy ? "A abrir…" : "Premium do espaço (checkout)"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
