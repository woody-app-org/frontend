import { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { fetchProfileSignalStatus, type ProfileSignalStatus } from "../services/profile-signals.service";
import { ProfileSignalDialog } from "./ProfileSignalDialog";

export interface ProfileSignalButtonProps {
  recipientUserId: number;
  recipientName: string;
}

function formatNextAllowed(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProfileSignalButton({ recipientUserId, recipientName }: ProfileSignalButtonProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ProfileSignalStatus | null>(null);
  const [error, setError] = useState<{ recipientUserId: number; message: string } | null>(null);

  useEffect(() => {
    let alive = true;
    if (!Number.isFinite(recipientUserId) || recipientUserId < 1) return;

    void fetchProfileSignalStatus(recipientUserId)
      .then((next) => {
        if (!alive) return;
        setStatus(next);
        setError(null);
      })
      .catch((e) => {
        if (!alive) return;
        setError({
          recipientUserId,
          message: e instanceof Error ? e.message : "Não foi possível verificar sinais.",
        });
      });

    return () => {
      alive = false;
    };
  }, [recipientUserId]);

  if (!Number.isFinite(recipientUserId) || recipientUserId < 1) return null;

  const statusForRecipient = status?.recipientUserId === recipientUserId ? status : null;
  const errorForRecipient = error?.recipientUserId === recipientUserId ? error.message : null;
  const loading = !statusForRecipient && !errorForRecipient;
  const nextAllowed = formatNextAllowed(statusForRecipient?.nextAllowedAt ?? null);
  const disabled = loading || statusForRecipient?.canSend === false;
  const helper = nextAllowed ? `Novo sinal disponível em ${nextAllowed}.` : errorForRecipient;

  return (
    <div className="flex min-w-0 flex-col gap-1 items-stretch sm:items-end">
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        aria-label={`Enviar sinal para ${recipientName}`}
        className={cn(
          woodyFocus.ring,
          "touch-manipulation min-h-10 w-full rounded-lg border-[var(--woody-accent)]/25 bg-[var(--woody-bg)] text-sm font-medium text-[var(--woody-text)] transition-transform hover:bg-[var(--woody-nav)]/10 active:scale-[0.98] sm:min-h-9 sm:w-auto"
        )}
        onClick={() => setOpen(true)}
      >
        {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Heart className="size-4 text-[var(--woody-nav)]" aria-hidden />}
        Enviar sinal
      </Button>
      {helper ? (
        <p className="max-w-[14rem] text-right text-xs leading-snug text-[var(--woody-muted)]" role={errorForRecipient ? "alert" : undefined}>
          {helper}
        </p>
      ) : null}
      <ProfileSignalDialog
        open={open}
        onOpenChange={setOpen}
        recipientUserId={recipientUserId}
        recipientName={recipientName}
        onSent={(nextAllowedAt) => {
          setStatus({
            recipientUserId,
            canSend: false,
            lastSentAt: new Date().toISOString(),
            nextAllowedAt: nextAllowedAt ?? null,
          });
        }}
      />
    </div>
  );
}
