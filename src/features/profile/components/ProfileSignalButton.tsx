import { useState } from "react";
import { Heart, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { ProfileSignalDialog } from "./ProfileSignalDialog";
import { useProfileSignalEligibility } from "../hooks/useProfileSignalEligibility";

export interface ProfileSignalButtonProps {
  recipientUserId: number;
  recipientName: string;
  /** Alinhar com grelha de ações ao lado de Mensagem (perfil alheio). */
  className?: string;
}

function eligibilityHint(code: string | null): string {
  if (code === "blocked") {
    return "Não foi possível enviar agora. Tenta novamente mais tarde.";
  }
  if (code === "receiver_unavailable" || code === "social_mismatch") {
    return "Essa pessoa não está recebendo sinais no momento.";
  }
  return "Não foi possível usar os sinais com esta pessoa.";
}

export function ProfileSignalButton({ recipientUserId, recipientName, className }: ProfileSignalButtonProps) {
  const [open, setOpen] = useState(false);
  const { loading, senderEligible, eligibilityRestrictionCode, error } =
    useProfileSignalEligibility(recipientUserId);

  if (!Number.isFinite(recipientUserId) || recipientUserId < 1) return null;

  if (loading) {
    return (
      <div
        className={cn(
          "flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--woody-divider)] bg-[var(--woody-bg)]/90 px-3 py-2 text-sm text-[var(--woody-muted)] sm:min-h-9",
          className
        )}
        aria-busy
      >
        <Loader2 className="size-4 animate-spin text-[var(--woody-nav)]" aria-hidden />
        A verificar sinais…
      </div>
    );
  }

  if (error) {
    return (
      <p
        className={cn(
          "max-w-md rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-left text-sm text-amber-900 sm:col-span-2",
          className
        )}
      >
        {error}
      </p>
    );
  }

  if (!senderEligible) {
    return (
      <p
        className={cn(
          "max-w-md rounded-lg border border-dashed border-[var(--woody-divider)] bg-[var(--woody-card)]/80 px-3 py-2.5 text-left text-sm leading-relaxed text-[var(--woody-muted)] sm:col-span-2",
          className
        )}
      >
        {eligibilityHint(eligibilityRestrictionCode)}
      </p>
    );
  }

  return (
    <div className={cn("flex min-w-0 flex-col items-stretch gap-1", className)}>
      <Button
        type="button"
        variant="outline"
        aria-label={`Enviar sinal para ${recipientName}`}
        className={cn(
          woodyFocus.ring,
          "touch-manipulation min-h-10 w-full rounded-lg border-[var(--woody-accent)]/25 bg-[var(--woody-bg)] text-sm font-medium text-[var(--woody-text)] transition-transform hover:bg-[var(--woody-nav)]/10 active:scale-[0.98] sm:min-h-9"
        )}
        onClick={() => setOpen(true)}
      >
        <span className="relative inline-flex size-4 items-center justify-center">
          <Heart className="size-4 text-[var(--woody-nav)]" aria-hidden />
          <Sparkles className="absolute -right-1 -top-1 size-2.5 text-[var(--woody-nav)]" aria-hidden />
        </span>
        Enviar sinal
      </Button>
      <ProfileSignalDialog
        open={open}
        onOpenChange={setOpen}
        recipientUserId={recipientUserId}
        recipientName={recipientName}
      />
    </div>
  );
}
