import { useCallback, useState, type ReactNode } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { woodyFocus, woodySurface } from "@/lib/woody-ui";
import { useSubscriptionCapabilities } from "../useSubscriptionCapabilities";
import { createSubscriptionCheckout } from "../services/billingCheckout.service";
import { PRO_MONTHLY_CHECKOUT_PLAN_CODE } from "../constants";
import { ProBadge } from "./ProBadge";

export interface UpgradeProDialogProps {
  children: ReactNode;
}

const benefits = [
  "Criar comunidades na Woody",
  "Badge Pro visível no teu perfil e interações",
  "Suporte à evolução da plataforma com prioridade",
];

export function UpgradeProDialog({ children }: UpgradeProDialogProps) {
  const { isProUser } = useSubscriptionCapabilities();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { url } = await createSubscriptionCheckout(PRO_MONTHLY_CHECKOUT_PLAN_CODE);
      window.location.assign(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível abrir o checkout.");
      setLoading(false);
    }
  }, []);

  if (isProUser) {
    return <>{children}</>;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md border-[var(--woody-accent)]/20">
        <DialogHeader className="flex-col items-start gap-1">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="size-5 text-[var(--woody-nav)]" aria-hidden />
            Woody Pro
          </DialogTitle>
          <DialogDescription className="text-left text-[var(--woody-muted)]">
            Pagamento seguro via Stripe. O plano só fica ativo após confirmação no servidor — não confies apenas nesta
            página após o regresso do checkout.
          </DialogDescription>
        </DialogHeader>

        <div className={cn(woodySurface.cardHero, "space-y-3 rounded-xl border border-[var(--woody-accent)]/15 p-4")}>
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--woody-muted)]">Plano mensal</p>
              <p className="text-2xl font-bold text-[var(--woody-text)]">
                Pro{" "}
                <ProBadge variant="inline" className="translate-y-px" />
              </p>
            </div>
            <p className="text-right text-sm text-[var(--woody-muted)]">
              Valor final e IVA são apresentados no checkout Stripe conforme a tua região.
            </p>
          </div>
          <ul className="space-y-2 text-sm text-[var(--woody-text)]">
            {benefits.map((t) => (
              <li key={t} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-[var(--woody-nav)]" aria-hidden />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {error ? (
          <p
            className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline" className={cn(woodyFocus.ring, "border-[var(--woody-accent)]/25")}>
              Agora não
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={loading}
            className={cn(woodyFocus.ring, "bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90")}
            onClick={handleSubscribe}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                A abrir checkout…
              </>
            ) : (
              "Continuar para pagamento"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
