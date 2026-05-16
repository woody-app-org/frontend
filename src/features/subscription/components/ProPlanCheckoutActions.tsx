import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { PRO_ANNUAL_CHECKOUT_PLAN_CODE, PRO_MONTHLY_CHECKOUT_PLAN_CODE } from "../constants";

export interface ProPlanCheckoutActionsProps {
  startCheckout: (planCode: string) => void | Promise<void>;
  loadingCode: string | null;
  error: string | null;
  className?: string;
}

export function ProPlanCheckoutActions({
  startCheckout,
  loadingCode,
  error,
  className,
}: ProPlanCheckoutActionsProps) {
  const busy = loadingCode !== null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          disabled={busy}
          className={cn(woodyFocus.ring, "flex-1 bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90 sm:min-w-[9rem]")}
          onClick={() => void startCheckout(PRO_MONTHLY_CHECKOUT_PLAN_CODE)}
        >
          {loadingCode === PRO_MONTHLY_CHECKOUT_PLAN_CODE ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              A abrir…
            </>
          ) : (
            "Pro mensal"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          className={cn(woodyFocus.ring, "flex-1 border-[var(--woody-nav)]/35 sm:min-w-[9rem]")}
          onClick={() => void startCheckout(PRO_ANNUAL_CHECKOUT_PLAN_CODE)}
        >
          {loadingCode === PRO_ANNUAL_CHECKOUT_PLAN_CODE ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              A abrir…
            </>
          ) : (
            "Pro anual"
          )}
        </Button>
      </div>
      <p className="text-xs leading-relaxed text-[var(--woody-muted)]">
        Valor final e IVA aparecem no checkout Stripe conforme a tua região.
      </p>
      {error ? (
        <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
