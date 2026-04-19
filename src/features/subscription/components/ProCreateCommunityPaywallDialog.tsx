import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { woodyFocus, woodySurface } from "@/lib/woody-ui";
import { ProBadge } from "./ProBadge";
import { ProUpgradeBenefitsList } from "./ProUpgradeBenefitsList";
import { ProPlanCheckoutActions } from "./ProPlanCheckoutActions";
import { useProCheckout } from "../hooks/useProCheckout";

export interface ProCreateCommunityPaywallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProCreateCommunityPaywallDialog({ open, onOpenChange }: ProCreateCommunityPaywallDialogProps) {
  const { startCheckout, loadingCode, error } = useProCheckout();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-[var(--woody-accent)]/20">
        <DialogHeader className="flex-col items-start gap-1">
          <DialogTitle className="flex flex-wrap items-center gap-2 text-xl text-left">
            <Sparkles className="size-5 shrink-0 text-[var(--woody-nav)]" aria-hidden />
            Criar comunidades é{" "}
            <span className="inline-flex items-center gap-1">
              Woody <ProBadge variant="inline" className="translate-y-px" />
            </span>
          </DialogTitle>
          <DialogDescription className="text-left text-[var(--woody-muted)]">
            A moderação do grupo continua a ser tua após a criação. O plano Pro desbloqueia este passo com pagamento
            seguro via Stripe — o estado oficial da conta vem sempre da API após o checkout.
          </DialogDescription>
        </DialogHeader>

        <div className={cn(woodySurface.cardHero, "space-y-3 rounded-xl border border-[var(--woody-accent)]/15 p-4")}>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--woody-muted)]">Incluído no Pro</p>
          <ProUpgradeBenefitsList />
        </div>

        <ProPlanCheckoutActions startCheckout={startCheckout} loadingCode={loadingCode} error={error} />

        <div className="flex flex-col-reverse gap-2 border-t border-[var(--woody-accent)]/10 pt-3 sm:flex-row sm:justify-between sm:items-center">
          <Button type="button" variant="ghost" className={cn(woodyFocus.ring, "text-[var(--woody-muted)]")} asChild>
            <Link to="/planos" onClick={() => onOpenChange(false)}>
              Ver página de planos
            </Link>
          </Button>
          <Button type="button" variant="outline" className={cn(woodyFocus.ring)} onClick={() => onOpenChange(false)}>
            Agora não
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
