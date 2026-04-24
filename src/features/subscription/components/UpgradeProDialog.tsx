import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
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
import { useProCheckout } from "../hooks/useProCheckout";
import { ProBadge } from "./ProBadge";
import { ProUpgradeBenefitsList } from "./ProUpgradeBenefitsList";
import { ProPlanCheckoutActions } from "./ProPlanCheckoutActions";

export interface UpgradeProDialogProps {
  children: ReactNode;
}

export function UpgradeProDialog({ children }: UpgradeProDialogProps) {
  const { isProUser } = useSubscriptionCapabilities();
  const [open, setOpen] = useState(false);
  const { startCheckout, loadingCode, error } = useProCheckout();

  if (isProUser) {
    return <>{children}</>;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg border-[var(--woody-accent)]/20">
        <DialogHeader className="flex-col items-start gap-1">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="size-5 text-[var(--woody-nav)]" aria-hidden />
            Woody <ProBadge variant="inline" className="translate-y-px" />
          </DialogTitle>
          <DialogDescription className="text-left text-[var(--woody-muted)]">
            Pagamento seguro via Stripe. O plano só fica ativo após confirmação no servidor — o estado oficial vem da
            API, não só desta janela.
          </DialogDescription>
        </DialogHeader>

        <div className={cn(woodySurface.cardHero, "space-y-3 rounded-xl border border-[var(--woody-accent)]/15 p-4")}>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--woody-muted)]">Benefícios</p>
          <ProUpgradeBenefitsList />
        </div>

        <ProPlanCheckoutActions startCheckout={startCheckout} loadingCode={loadingCode} error={error} />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:items-center">
          <Button type="button" variant="ghost" className={cn(woodyFocus.ring, "text-[var(--woody-muted)]")} asChild>
            <Link to="/planos" onClick={() => setOpen(false)}>
              Ver página de planos
            </Link>
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline" className={cn(woodyFocus.ring, "border-[var(--woody-accent)]/25")}>
              Agora não
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
