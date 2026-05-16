import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import { useAuth } from "@/features/auth/context/AuthContext";
import { fetchMySubscriptionState } from "@/features/auth/services/auth.service";
import { cn } from "@/lib/utils";
import { woodyFocus, woodyLayout, woodyMotion, woodySurface } from "@/lib/woody-ui";
import { useSubscriptionCapabilities } from "../useSubscriptionCapabilities";
import { useProCheckout } from "../hooks/useProCheckout";
import {
  MAX_ANNUAL_CHECKOUT_PLAN_CODE,
  MAX_MONTHLY_CHECKOUT_PLAN_CODE,
} from "../constants";
import {
  MAX_PLAN_CHECKOUT_ENABLED,
  PLAN_BENEFITS_PREVIEW_COUNT,
  type BillingModality,
  getMaxPriceDisplay,
  getPaidCheckoutPlanCode,
  getProPriceDisplay,
  PLAN_CRIADOR_MAX_BENEFITS,
  PLAN_CRIADOR_MAX_INTRO,
  PLAN_CRIADOR_PRO_BENEFITS,
  PLAN_ESSENCIAL_BENEFITS,
} from "../lib/planCatalog";
import { SubscriptionAccountPanel } from "../components/SubscriptionAccountPanel";
import { BillingModalityToggle } from "../components/BillingModalityToggle";

const cardPad = "p-4 sm:p-5";
const cardFooterClass =
  "mt-4 border-t border-[var(--woody-accent)]/12 pt-4 dark:border-[var(--woody-accent)]/14";

function PlanBadge({
  children,
  variant,
}: {
  children: ReactNode;
  variant: "free" | "featured" | "scale";
}) {
  const styles = {
    free: "bg-[var(--woody-bg)] text-[var(--woody-text)] ring-[var(--woody-accent)]/18",
    featured: "bg-[var(--woody-nav)]/14 text-[var(--woody-text)] ring-[var(--woody-nav)]/30",
    scale: "bg-[var(--woody-text)]/[0.06] text-[var(--woody-text)] ring-[var(--woody-text)]/12",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.08em] ring-1 sm:px-3 sm:py-0.5 sm:text-[0.65rem]",
        styles[variant]
      )}
    >
      {children}
    </span>
  );
}

function CurrentPlanPill() {
  return (
    <span className="inline-flex w-fit items-center rounded-full bg-[var(--woody-nav)]/12 px-2.5 py-0.5 text-[0.62rem] font-semibold text-[var(--woody-text)] ring-1 ring-[var(--woody-nav)]/22 sm:text-[0.65rem]">
      Plano atual
    </span>
  );
}

function PlanBenefitList({ items, listId }: { items: string[]; listId?: string }) {
  return (
    <ul
      id={listId}
      className="flex flex-col gap-1.5 text-[0.8125rem] leading-[1.35] text-[var(--woody-text)] sm:text-[0.8375rem] sm:leading-[1.4]"
    >
      {items.map((t) => (
        <li key={t} className="flex gap-2">
          <Check className="mt-[0.15rem] size-3.5 shrink-0 text-[var(--woody-nav)] sm:size-4" strokeWidth={2.2} aria-hidden />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

function ExpandableBenefits({
  items,
  previewCount,
  sectionId,
  expanded,
  onToggle,
  intro,
}: {
  items: string[];
  previewCount: number;
  sectionId: string;
  expanded: boolean;
  onToggle: () => void;
  intro?: ReactNode;
}) {
  const hasMore = items.length > previewCount;
  const shown = expanded ? items : items.slice(0, previewCount);
  const extraCount = items.length - previewCount;

  return (
    <div className="space-y-2">
      {intro ? <div className="text-[0.8125rem] font-semibold leading-snug text-[var(--woody-text)] sm:text-sm">{intro}</div> : null}
      <PlanBenefitList items={shown} listId={`${sectionId}-benefits`} />
      {hasMore ? (
        <button
          type="button"
          className={cn(
            woodyFocus.ring,
            "group mt-0.5 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-center text-xs font-semibold text-[var(--woody-nav)] transition-colors hover:bg-[var(--woody-nav)]/8 sm:text-[0.8125rem]"
          )}
          aria-expanded={expanded}
          aria-controls={`${sectionId}-benefits`}
          onClick={onToggle}
        >
          <span>{expanded ? "Ver menos" : `Ver todos os benefícios (${extraCount})`}</span>
          <ChevronDown
            className={cn("size-3.5 shrink-0 transition-transform duration-200 ease-out", expanded && "rotate-180")}
            aria-hidden
          />
        </button>
      ) : null}
    </div>
  );
}

export function PlanosPage() {
  const { patchUser } = useAuth();
  const { isProUser, subscription, canOpenBillingPortal } = useSubscriptionCapabilities();
  const { startCheckout, loadingCode, error } = useProCheckout();
  const [modality, setModality] = useState<BillingModality>("monthly");
  const [expandEssencial, setExpandEssencial] = useState(false);
  const [expandPro, setExpandPro] = useState(false);
  const [expandMax, setExpandMax] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const sub = await fetchMySubscriptionState();
        if (!cancelled) patchUser({ subscription: sub });
      } catch {
        /* mantém sessão local */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [patchUser]);

  const planCode = subscription?.planCode ?? null;
  const isEssencialCurrent = !isProUser;
  const isMaxMonthlyCurrent = isProUser && planCode === MAX_MONTHLY_CHECKOUT_PLAN_CODE;
  const isMaxAnnualCurrent = isProUser && planCode === MAX_ANNUAL_CHECKOUT_PLAN_CODE;
  const isMaxPlanCurrent = isMaxMonthlyCurrent || isMaxAnnualCurrent;
  const isProTierCurrent = isProUser && !isMaxPlanCurrent;

  const proPrice = getProPriceDisplay(modality);
  const maxPrice = getMaxPriceDisplay(modality);
  const proCheckoutCode = getPaidCheckoutPlanCode("pro", modality);
  const maxCheckoutCode = getPaidCheckoutPlanCode("max", modality);

  return (
    <FeedLayout>
      <div
        className={cn(
          "mx-auto w-full max-w-[72rem] pb-24 md:pb-10",
          woodyLayout.pagePadWide,
          "flex flex-col gap-6 md:gap-8"
        )}
      >
        <header className="space-y-2 text-center sm:text-left sm:space-y-2.5">
          <h1 className="text-balance text-xl font-bold tracking-tight text-[var(--woody-text)] sm:text-2xl md:text-[1.75rem] md:leading-tight">
            Escolha a modalidade ideal para o seu perfil
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[var(--woody-muted)] sm:mx-0">
            Planos pensados para começar, crescer e escalar sua presença na Woody.
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
          <p
            className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-900 dark:text-red-100"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="flex flex-col items-stretch gap-3 sm:items-start">
          <p
            id="billing-modality-label"
            className="text-center text-xs font-semibold text-[var(--woody-muted)] sm:text-left sm:text-sm"
          >
            Modalidade de pagamento <span className="font-normal">(planos pagos)</span>
          </p>
          <BillingModalityToggle value={modality} onChange={setModality} aria-labelledby="billing-modality-label" />
        </div>

        <div className="grid gap-4 md:gap-4 lg:grid-cols-3 lg:items-start lg:gap-5">
          {/* Plano Essencial */}
          <section
            className={cn(
              woodySurface.cardHero,
              woodyMotion.cardHover,
              "flex flex-col rounded-2xl border border-[var(--woody-accent)]/14",
              cardPad
            )}
          >
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 space-y-1">
                <PlanBadge variant="free">Gratuito</PlanBadge>
                <h2 className="text-base font-bold text-[var(--woody-text)] sm:text-lg">Plano Essencial</h2>
              </div>
              {isEssencialCurrent ? <CurrentPlanPill /> : null}
            </div>
            <p className="text-[0.8125rem] leading-snug text-[var(--woody-muted)] sm:text-sm">Para começar na plataforma</p>

            <ExpandableBenefits
              sectionId="plan-essencial"
              items={PLAN_ESSENCIAL_BENEFITS}
              previewCount={PLAN_BENEFITS_PREVIEW_COUNT.essencial}
              expanded={expandEssencial}
              onToggle={() => setExpandEssencial((v) => !v)}
            />

            <div className={cardFooterClass}>
              <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--woody-muted)]">Preço</p>
              <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--woody-text)] sm:text-2xl">Sem custo</p>
              <p className="text-xs font-medium text-[var(--woody-muted)] sm:text-sm">R$ 0,00</p>
              {isEssencialCurrent ? (
                <Button
                  type="button"
                  disabled
                  variant="outline"
                  size="lg"
                  className={cn(woodyFocus.ring, "mt-3 h-10 w-full border-[var(--woody-accent)]/25 text-sm font-semibold sm:h-11")}
                >
                  É o teu plano atual
                </Button>
              ) : (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className={cn(
                    woodyFocus.ring,
                    "mt-3 h-10 w-full border-[var(--woody-nav)]/35 text-sm font-semibold hover:bg-[var(--woody-nav)]/8 sm:h-11"
                  )}
                >
                  <Link to="/feed">Começar grátis</Link>
                </Button>
              )}
            </div>
          </section>

          {/* Criador Pro — destaque */}
          <section
            className={cn(
              woodySurface.cardHero,
              woodyMotion.cardHover,
              "relative flex flex-col overflow-hidden rounded-2xl border-2 border-[var(--woody-nav)]/38 shadow-[0_8px_28px_rgba(10,10,10,0.07)]",
              "lg:ring-2 lg:ring-[var(--woody-nav)]/18",
              cardPad
            )}
          >
            <div
              className="pointer-events-none absolute -right-12 -top-16 size-36 rounded-full bg-[var(--woody-nav)]/09 blur-2xl sm:size-40"
              aria-hidden
            />
            <div className="relative mb-2 flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 space-y-1">
                <PlanBadge variant="featured">Mais escolhido</PlanBadge>
                <h2 className="text-base font-bold text-[var(--woody-text)] sm:text-lg">Criador Pro</h2>
              </div>
              {isProTierCurrent ? <CurrentPlanPill /> : null}
            </div>
            <p className="relative text-[0.8125rem] leading-snug text-[var(--woody-muted)] sm:text-sm">
              Para quem quer presença profissional
            </p>

            <div className="relative mt-2">
              <ExpandableBenefits
                sectionId="plan-pro"
                items={PLAN_CRIADOR_PRO_BENEFITS}
                previewCount={PLAN_BENEFITS_PREVIEW_COUNT.pro}
                expanded={expandPro}
                onToggle={() => setExpandPro((v) => !v)}
              />
            </div>

            <div className={cn("relative border-[var(--woody-nav)]/12", cardFooterClass)}>
              <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--woody-muted)]">Preço</p>
              <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--woody-text)] sm:text-2xl">{proPrice.primary}</p>
              {proPrice.secondary ? (
                <p className="text-xs font-medium text-[var(--woody-muted)] sm:text-sm">{proPrice.secondary}</p>
              ) : null}
              <Button
                type="button"
                size="lg"
                disabled={isProUser || loadingCode !== null || !proCheckoutCode}
                className={cn(
                  woodyFocus.ring,
                  "relative mt-3 h-10 w-full bg-[var(--woody-nav)] text-sm font-semibold text-white hover:bg-[var(--woody-nav)]/92 sm:h-11"
                )}
                onClick={() => proCheckoutCode && void startCheckout(proCheckoutCode)}
              >
                {loadingCode === proCheckoutCode ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                    A abrir checkout…
                  </>
                ) : isProUser ? (
                  "Já tens o Criador Pro"
                ) : (
                  "Escolher Pro"
                )}
              </Button>
            </div>
          </section>

          {/* Criador Max */}
          <section
            className={cn(
              woodySurface.cardHero,
              woodyMotion.cardHover,
              "flex flex-col rounded-2xl border border-[var(--woody-accent)]/14",
              cardPad
            )}
          >
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 space-y-1">
                <PlanBadge variant="scale">Escala máxima</PlanBadge>
                <h2 className="text-base font-bold text-[var(--woody-text)] sm:text-lg">Criador Max</h2>
              </div>
              {isMaxPlanCurrent ? <CurrentPlanPill /> : null}
            </div>
            <p className="text-[0.8125rem] leading-snug text-[var(--woody-muted)] sm:text-sm">
              Para expandir com mais gestão e alcance
            </p>

            <div className="mt-2">
              <ExpandableBenefits
                sectionId="plan-max"
                items={PLAN_CRIADOR_MAX_BENEFITS}
                previewCount={PLAN_BENEFITS_PREVIEW_COUNT.max}
                expanded={expandMax}
                onToggle={() => setExpandMax((v) => !v)}
                intro={PLAN_CRIADOR_MAX_INTRO}
              />
            </div>

            <div className={cardFooterClass}>
              <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--woody-muted)]">Preço</p>
              <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--woody-text)] sm:text-2xl">{maxPrice.primary}</p>
              {maxPrice.secondary ? (
                <p className="text-xs font-medium text-[var(--woody-muted)] sm:text-sm">{maxPrice.secondary}</p>
              ) : null}
              {!MAX_PLAN_CHECKOUT_ENABLED ? (
                <p className="mt-1.5 text-[0.7rem] leading-snug text-[var(--woody-muted)] sm:text-xs">
                  O checkout do Criador Max ainda não está ligado às subscrições — os preços acima reflectem a oferta prevista.
                </p>
              ) : null}
              <Button
                type="button"
                size="lg"
                disabled={!maxCheckoutCode || loadingCode !== null || isMaxPlanCurrent}
                variant={MAX_PLAN_CHECKOUT_ENABLED ? "default" : "outline"}
                className={cn(
                  woodyFocus.ring,
                  "mt-3 h-10 w-full text-sm font-semibold sm:h-11",
                  MAX_PLAN_CHECKOUT_ENABLED
                    ? "bg-[var(--woody-text)] text-[var(--woody-card)] hover:bg-[var(--woody-text)]/90"
                    : "border-[var(--woody-accent)]/25"
                )}
                onClick={() => maxCheckoutCode && void startCheckout(maxCheckoutCode)}
              >
                {loadingCode === maxCheckoutCode ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                    A abrir checkout…
                  </>
                ) : isMaxPlanCurrent ? (
                  "É o teu plano atual"
                ) : !MAX_PLAN_CHECKOUT_ENABLED || !maxCheckoutCode ? (
                  "Brevemente"
                ) : (
                  "Escolher Max"
                )}
              </Button>
            </div>
          </section>
        </div>

        <footer className="flex flex-col gap-3 rounded-2xl border border-[var(--woody-accent)]/12 bg-[var(--woody-bg)]/60 px-4 py-3.5 text-sm text-[var(--woody-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p>Pagamentos processados com segurança. O estado da conta atualiza após confirmação no servidor.</p>
          <Button asChild variant="ghost" size="sm" className={cn(woodyFocus.ring, "shrink-0 text-[var(--woody-nav)]")}>
            <Link to="/feed">Voltar ao feed</Link>
          </Button>
        </footer>
      </div>
    </FeedLayout>
  );
}
