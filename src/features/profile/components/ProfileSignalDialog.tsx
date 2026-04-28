import { useMemo, useState } from "react";
import { Loader2, Send, Sparkles, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyDialogScroll, woodyFocus } from "@/lib/woody-ui";
import {
  PROFILE_SIGNAL_OPTIONS,
  sendProfileSignal,
  type ProfileSignalType,
} from "../services/profile-signals.service";

export interface ProfileSignalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientUserId: number;
  recipientName: string;
  onSent?: (nextAllowedAt?: string | null) => void;
}

export function ProfileSignalDialog({
  open,
  onOpenChange,
  recipientUserId,
  recipientName,
  onSent,
}: ProfileSignalDialogProps) {
  const [selected, setSelected] = useState<ProfileSignalType>("te_notei");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedOption = useMemo(
    () => PROFILE_SIGNAL_OPTIONS.find((option) => option.type === selected) ?? PROFILE_SIGNAL_OPTIONS[0],
    [selected]
  );

  const send = async () => {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const signal = await sendProfileSignal(recipientUserId, selected);
      setSuccess(`${signal.label} enviado em privado.`);
      onSent?.(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível enviar o sinal.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "bottom-0 top-auto max-h-[min(88dvh,760px)] max-w-xl translate-y-0 rounded-b-none p-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-2xl",
          "overflow-hidden"
        )}
      >
        <DialogHeader className="border-b border-[var(--woody-accent)]/12 p-4 pb-3 sm:p-5">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="min-w-0">
              <DialogTitle className="text-left text-lg">Enviar sinal</DialogTitle>
              <DialogDescription className="mt-1 text-left">
                Escolhe uma reação leve para enviar em privado para {recipientName}.
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn("size-9 shrink-0 rounded-full", woodyFocus.ring)}
                aria-label="Fechar"
              >
                <X className="size-5" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className={cn(woodyDialogScroll, "space-y-4 p-4 sm:p-5")}>
          <div className="rounded-2xl border border-[var(--woody-lime)]/30 bg-[var(--woody-tag-bg)] px-4 py-3 text-sm text-[var(--woody-text)]">
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles className="size-4 text-[var(--woody-nav)]" aria-hidden />
              {selectedOption.label}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[var(--woody-muted)]">
              Só {recipientName} verá este sinal. Ele não aparece no perfil público.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {PROFILE_SIGNAL_OPTIONS.map((option) => {
              const active = option.type === selected;
              return (
                <button
                  key={option.type}
                  type="button"
                  aria-pressed={active}
                  className={cn(
                    woodyFocus.ring,
                    "touch-manipulation rounded-2xl border px-3 py-3 text-left transition-colors",
                    active
                      ? "border-[var(--woody-nav)] bg-[var(--woody-nav)]/10"
                      : "border-[var(--woody-divider)] bg-[var(--woody-card)] hover:bg-[var(--woody-nav)]/6"
                  )}
                  onClick={() => {
                    setSelected(option.type);
                    setError(null);
                    setSuccess(null);
                  }}
                >
                  <span className="block text-sm font-semibold text-[var(--woody-text)]">{option.label}</span>
                  <span className="mt-1 block text-xs text-[var(--woody-muted)]">{option.hint}</span>
                </button>
              );
            })}
          </div>

          {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
          {success ? <p className="text-sm text-[var(--woody-nav)]" role="status">{success}</p> : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="min-h-10 rounded-xl">
                Fechar
              </Button>
            </DialogClose>
            <Button
              type="button"
              disabled={busy || Boolean(success)}
              className={cn(
                woodyFocus.ring,
                "min-h-10 rounded-xl bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90"
              )}
              onClick={() => void send()}
            >
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
              {busy ? "A enviar..." : "Enviar sinal"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
