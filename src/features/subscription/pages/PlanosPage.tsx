import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import { useAuth } from "@/features/auth/context/AuthContext";
import { fetchMySubscriptionState } from "@/features/auth/services/auth.service";
import { cn } from "@/lib/utils";
import { woodyFocus, woodyLayout, woodySurface } from "@/lib/woody-ui";
import { ProBadge } from "../components/ProBadge";
import { ProUpgradeBenefitsList } from "../components/ProUpgradeBenefitsList";
import { useSubscriptionCapabilities } from "../useSubscriptionCapabilities";
import { useProCheckout } from "../hooks/useProCheckout";
import { PRO_ANNUAL_CHECKOUT_PLAN_CODE, PRO_MONTHLY_CHECKOUT_PLAN_CODE } from "../constants";
import { WOODY_FREE_INCLUDES } from "../lib/subscriptionCopy";
import { SubscriptionAccountPanel } from "../components/SubscriptionAccountPanel";

function PlanPill({ children, active }: { children: ReactNode; active?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide",
        active
          ? "bg-[var(--woody-nav)]/15 text-[var(--woody-text)] ring-1 ring-[var(--woody-nav)]/25"
          : "bg-[var(--woody-bg)]/80 text-[var(--woody-muted)] ring-1 ring-[var(--woody-accent)]/12"
      )}
    >
      {children}
    </span>
  );
}

export function PlanosPage() {
  const { patchUser } = useAuth();
  const { isProUser, subscription, canOpenBillingPortal } = useSubscriptionCapabilities();
  const { startCheckout, loadingCode, error } = useProCheckout();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const sub = await fetchMySubscriptionState();
        if (!cancelled) patchUser({ subscription: sub });
      } catch {
        /* mantém sessão local; checkout já tratou sucesso noutra rota */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [patchUser]);

  const planCode = subscription?.planCode ?? null;
  const isCurrentFree = !isProUser;
  const isCurrentMonthly = isProUser && planCode === PRO_MONTHLY_CHECKOUT_PLAN_CODE;
  const isCurrentAnnual = isProUser && planCode === PRO_ANNUAL_CHECKOUT_PLAN_CODE;
  const isCurrentProUnknown = isProUser && !isCurrentMonthly && !isCurrentAnnual;

  return (
    <FeedLayout>
      <div
        className={cn(
          "mx-auto w-full max-w-5xl pb-24 md:pb-10",
          woodyLayout.pagePadWide,
          woodyLayout.stackGapTight
        )}
      >
        <header className="space-y-3 text-center sm:text-left">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--woody-nav)]/10 px-3 py-1 text-xs font-semibold text-[var(--woody-text)] ring-1 ring-[var(--woody-accent)]/15">
            <Sparkles className="size-3.5 text-[var(--woody-nav)]" aria-hidden />
            Planos Woody
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--woody-text)] sm:text-3xl">
            Escolhe o ritmo que faz sentido para ti
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[var(--woody-muted)] sm:mx-0">
            O Free cobre o essencial da rede. O Pro acrescenta criação de comunidades e visibilidade premium — sempre
            confirmado no servidor após o pagamento.
          </p>
        </header>

        {isProUser || canOpenBillingPortal ? (
          <SubscriptionAccountPanel
            subscription={subscription}
            isProUser={isProUser}
            canOpenBillingPortal={canOpenBillingPortal}
          />
        ) : null}

        {error ? (
          <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
            {error}
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3 md:items-stretch">
          {/* Free */}
          <section
            className={cn(
              woodySurface.cardHero,
              "flex flex-col rounded-2xl border border-[var(--woody-accent)]/14 p-5 sm:p-6 shadow-[0_1px_3px_rgba(58,45,36,0.05)]"
            )}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-[var(--woody-text)]">Free</h2>
              {isCurrentFree ? <PlanPill active>Plano atual</PlanPill> : null}
            </div>
            <p className="text-sm text-[var(--woody-muted)]">Base completa para participar na Woody.</p>
            <ul className="mt-4 flex-1 space-y-2.5 text-sm text-[var(--woody-text)]">
              {WOODY_FREE_INCLUDES.map((t) => (
                <li key={t} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-[var(--woody-accent)]" aria-hidden />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-[var(--woody-muted)]">Criar comunidades próprias requer Woody Pro.</p>
          </section>

          {/* Pro mensal */}
          <section
            className={cn(
              woodySurface.cardHero,
              "relative flex flex-col overflow-hidden rounded-2xl border border-[var(--woody-nav)]/22 p-5 sm:p-6 shadow-[0_8px_28px_rgba(58,45,36,0.08)]"
            )}
          >
            <div
              className="pointer-events-none absolute -right-10 -top-16 size-40 rounded-full bg-[var(--woody-nav)]/12 blur-2xl"
              aria-hidden
            />
            <div className="relative mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-[var(--woody-text)]">
                Pro <span className="text-[var(--woody-muted)] font-semibold">mensal</span>
              </h2>
              {isCurrentMonthly || isCurrentProUnknown ? <PlanPill active>Plano atual</PlanPill> : null}
            </div>
            <p className="relative text-sm text-[var(--woody-muted)]">Flexibilidade máxima, renovação mensal.</p>
            <div className="relative mt-4 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--woody-muted)]">Incluído</p>
              <ProUpgradeBenefitsList className="mt-2 space-y-2 text-sm text-[var(--woody-text)]" />
            </div>
            <Button
              type="button"
              disabled={isProUser || loadingCode !== null}
              className={cn(woodyFocus.ring, "relative mt-6 w-full bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90")}
              onClick={() => void startCheckout(PRO_MONTHLY_CHECKOUT_PLAN_CODE)}
            >
              {loadingCode === PRO_MONTHLY_CHECKOUT_PLAN_CODE ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  A abrir checkout…
                </>
              ) : isProUser ? (
                "Já tens Pro"
              ) : (
                "Subscrever Pro mensal"
              )}
            </Button>
          </section>

          {/* Pro anual */}
          <section
            className={cn(
              woodySurface.cardHero,
              "relative flex flex-col overflow-hidden rounded-2xl border border-[var(--woody-accent)]/18 bg-[var(--woody-card)]/98 p-5 sm:p-6 shadow-[0_8px_28px_rgba(58,45,36,0.06)]"
            )}
          >
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-[var(--woody-nav)]/12 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--woody-nav)] ring-1 ring-[var(--woody-nav)]/20">
                Melhor valor
              </span>
              {isCurrentAnnual ? <PlanPill active>Plano atual</PlanPill> : null}
            </div>
            <h2 className="text-lg font-bold text-[var(--woody-text)]">
              Pro <span className="text-[var(--woody-muted)] font-semibold">anual</span>
            </h2>
            <p className="mt-1 text-sm text-[var(--woody-muted)]">Um ano de Pro com menos fricção administrativa.</p>
            <div className="mt-4 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--woody-muted)]">Incluído</p>
              <ProUpgradeBenefitsList className="mt-2 space-y-2 text-sm text-[var(--woody-text)]" />
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={isProUser || loadingCode !== null}
              className={cn(
                woodyFocus.ring,
                "mt-6 w-full border-[var(--woody-nav)]/35 font-semibold hover:bg-[var(--woody-nav)]/8"
              )}
              onClick={() => void startCheckout(PRO_ANNUAL_CHECKOUT_PLAN_CODE)}
            >
              {loadingCode === PRO_ANNUAL_CHECKOUT_PLAN_CODE ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  A abrir checkout…
                </>
              ) : isProUser ? (
                "Já tens Pro"
              ) : (
                "Subscrever Pro anual"
              )}
            </Button>
          </section>
        </div>

        <footer className="flex flex-col gap-3 rounded-2xl border border-[var(--woody-accent)]/12 bg-[var(--woody-bg)]/60 px-4 py-4 text-sm text-[var(--woody-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="flex flex-wrap items-center gap-2">
            <ProBadge variant="inline" />
            <span>Após o Stripe, o estado da conta é lido de novo da API (ex.: página de sucesso ou ao abrires Planos).</span>
          </p>
          <Button asChild variant="ghost" size="sm" className={cn(woodyFocus.ring, "shrink-0 text-[var(--woody-nav)]")}>
            <Link to="/feed">Voltar ao feed</Link>
          </Button>
        </footer>
      </div>
    </FeedLayout>
  );
}
