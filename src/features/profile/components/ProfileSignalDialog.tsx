import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Loader2, Send, Sparkles, X } from "lucide-react";
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
import { woodyFocus } from "@/lib/woody-ui";
import {
  PROFILE_SIGNAL_OPTIONS,
  type ProfileSignal,
  type ProfileSignalType,
} from "../services/profile-signals.service";
import { useSendProfileSignal } from "../hooks/useSendProfileSignal";
import { ProfileSignalOptionCard } from "./ProfileSignalOptionCard";

export interface ProfileSignalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientUserId: number;
  recipientName: string;
  onSent?: (signal: ProfileSignal) => void;
}

export function ProfileSignalDialog({
  open,
  onOpenChange,
  recipientUserId,
  recipientName,
  onSent,
}: ProfileSignalDialogProps) {
  const [selected, setSelected] = useState<ProfileSignalType>("te_notei");
  const { busy, error, sentSignal, send: sendSignal, reset } = useSendProfileSignal(recipientUserId);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      reset();
      setSelected("te_notei");
    }
    wasOpenRef.current = open;
  }, [open, reset]);

  const selectedOption = useMemo(
    () => PROFILE_SIGNAL_OPTIONS.find((option) => option.type === selected) ?? PROFILE_SIGNAL_OPTIONS[0],
    [selected]
  );

  const send = async () => {
    try {
      const signal = await sendSignal(selected);
      onSent?.(signal);
    } catch {
      // Erro tratado no hook / estado `error`.
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
    }
    onOpenChange(nextOpen);
  };

  const lockedAfterSend = Boolean(sentSignal);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[min(92dvh,820px)] flex-col gap-0 overflow-hidden p-0",
          "bottom-0 top-auto max-w-xl translate-y-0 rounded-b-none rounded-t-2xl border-[var(--woody-divider)] bg-[var(--woody-card)] shadow-[0_-8px_40px_rgba(10,10,10,0.12)] sm:bottom-auto sm:top-1/2 sm:max-h-[min(88vh,760px)] sm:-translate-y-1/2 sm:rounded-2xl sm:shadow-xl"
        )}
      >
        <DialogHeader className="shrink-0 border-b border-[var(--woody-accent)]/12 px-4 pb-3 pt-4 sm:px-5 sm:pb-4 sm:pt-5">
          <div className="flex items-start justify-between gap-3 pr-1">
            <div className="min-w-0">
              <DialogTitle className="text-left text-lg font-bold tracking-tight text-[var(--woody-text)]">
                Enviar sinal
              </DialogTitle>
              <DialogDescription className="mt-1.5 text-left text-sm leading-relaxed text-[var(--woody-muted)]">
                Escolhe um gesto leve. Ela recebe isto em privado — não aparece no perfil público.
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn("size-10 shrink-0 rounded-full", woodyFocus.ring)}
                aria-label="Fechar"
              >
                <X className="size-5" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div
            className={cn(
              "min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-4 py-4 sm:px-5",
              "pb-[max(0.5rem,env(safe-area-inset-bottom))]"
            )}
          >
            <div className="space-y-4 pb-2">
              <div className="rounded-2xl border border-[var(--woody-lime)]/28 bg-gradient-to-br from-[var(--woody-tag-bg)] to-[var(--woody-card)] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
                <div className="flex items-center gap-2 font-semibold text-[var(--woody-text)]">
                  <Sparkles className="size-4 shrink-0 text-[var(--woody-nav)]" aria-hidden />
                  <span className="text-sm">{selectedOption.label}</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--woody-muted)]">
                  Só {recipientName} vê este sinal na área privada de sinais.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {PROFILE_SIGNAL_OPTIONS.map((option) => (
                  <ProfileSignalOptionCard
                    key={option.type}
                    option={option}
                    active={option.type === selected}
                    disabled={busy || lockedAfterSend}
                    onSelect={(next) => {
                      reset();
                      setSelected(next.type);
                    }}
                  />
                ))}
              </div>

              {error ? (
                <div
                  className="rounded-xl border border-red-200/90 bg-red-50/95 px-3 py-2.5 text-sm leading-snug text-red-800"
                  role="alert"
                >
                  {error}
                </div>
              ) : null}

              {sentSignal ? (
                <div
                  className="flex items-start gap-2 rounded-xl border border-[var(--woody-nav)]/25 bg-[var(--woody-nav)]/10 px-3 py-2.5 text-sm text-[var(--woody-text)]"
                  role="status"
                  aria-live="polite"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--woody-nav)]" aria-hidden />
                  <span>
                    <span className="font-semibold text-[var(--woody-nav)]">{`${sentSignal.label} ${sentSignal.emoji}`.trim()}</span>
                    <span className="text-[var(--woody-muted)]"> enviado em privado.</span>
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          <div
            className={cn(
              "shrink-0 border-t border-[var(--woody-divider)]/90 bg-[var(--woody-card)] px-4 py-3 sm:px-5 sm:py-4",
              "pb-[max(0.75rem,env(safe-area-inset-bottom))]"
            )}
          >
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <DialogClose asChild>
                <Button type="button" variant="outline" className={cn(woodyFocus.ring, "min-h-11 w-full rounded-xl sm:min-h-10 sm:w-auto")}>
                  Fechar
                </Button>
              </DialogClose>
              <Button
                type="button"
                disabled={busy || lockedAfterSend}
                className={cn(
                  woodyFocus.ring,
                  "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/92 sm:min-h-10 sm:w-auto sm:min-w-[140px]"
                )}
                onClick={() => void send()}
              >
                {busy ? (
                  <>
                    <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                    <span>A enviar…</span>
                  </>
                ) : lockedAfterSend ? (
                  <>
                    <CheckCircle2 className="size-4 shrink-0" aria-hidden />
                    <span>Enviado</span>
                  </>
                ) : (
                  <>
                    <Send className="size-4 shrink-0" aria-hidden />
                    <span>Enviar sinal</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
