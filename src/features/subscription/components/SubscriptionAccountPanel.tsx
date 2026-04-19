import { ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus, woodySurface } from "@/lib/woody-ui";
import { ProBadge } from "./ProBadge";
import type { AuthUserSubscription } from "../types";
import { describeSubscriptionDetail, describeSubscriptionHeadline } from "../lib/subscriptionStatusUi";
import { useStripeCustomerPortal } from "../hooks/useStripeCustomerPortal";

export interface SubscriptionAccountPanelProps {
  subscription: AuthUserSubscription | undefined;
  isProUser: boolean;
  canOpenBillingPortal: boolean;
}

export function SubscriptionAccountPanel({
  subscription,
  isProUser,
  canOpenBillingPortal,
}: SubscriptionAccountPanelProps) {
  const sub = subscription;
  const { openPortal, loading, error } = useStripeCustomerPortal();

  if (!sub || (!isProUser && !canOpenBillingPortal)) {
    return null;
  }

  const detail = describeSubscriptionDetail(sub);

  return (
    <section
      className={cn(
        woodySurface.cardHero,
        "rounded-2xl border border-[var(--woody-accent)]/16 px-5 py-5 sm:px-6 sm:py-6"
      )}
      aria-labelledby="subscription-account-heading"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="subscription-account-heading" className="text-base font-bold text-[var(--woody-text)]">
              A tua assinatura
            </h2>
            {isProUser ? <ProBadge variant="inline" /> : null}
          </div>
          <p className="text-sm leading-relaxed text-[var(--woody-text)]/95">{describeSubscriptionHeadline(sub)}</p>
          {detail ? <p className="text-xs leading-relaxed text-[var(--woody-muted)]">{detail}</p> : null}
          <p className="text-xs leading-relaxed text-[var(--woody-muted)]">
            Cartão, faturas e cancelamento são tratados na{" "}
            <span className="font-medium text-[var(--woody-text)]">área hospedada da Stripe</span> — a Woody aplica
            alterações quando o servidor recebe os eventos oficiais.
          </p>
        </div>
        {canOpenBillingPortal ? (
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:min-w-[12rem]">
            <Button
              type="button"
              disabled={loading}
              className={cn(woodyFocus.ring, "w-full bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90")}
              onClick={() => void openPortal()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  A abrir…
                </>
              ) : (
                <>
                  Gerir na Stripe
                  <ExternalLink className="ml-2 size-4 opacity-90" aria-hidden />
                </>
              )}
            </Button>
            <p className="text-center text-[0.65rem] text-[var(--woody-muted)] sm:text-left">Pagamento e cancelamento</p>
          </div>
        ) : (
          <p className="text-xs text-[var(--woody-muted)] sm:max-w-xs sm:text-right">
            Sem cliente Stripe associado nesta conta — o portal abre após a primeira subscrição concluída.
          </p>
        )}
      </div>
      {error ? (
        <p className="mt-3 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
