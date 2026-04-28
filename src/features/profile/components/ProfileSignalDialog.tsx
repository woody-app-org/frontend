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

  const selectedOption = useMemo(
    () => PROFILE_SIGNAL_OPTIONS.find((option) => option.type === selected) ?? PROFILE_SIGNAL_OPTIONS[0],
    [selected]
  );

  const send = async () => {
    try {
      const signal = await sendSignal(selected);
      onSent?.(signal);
    } catch {
      // O hook já normaliza e expõe a mensagem de erro para a UI.
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
                Escolhe um gesto leve. Ela recebe isso em privado.
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
            {PROFILE_SIGNAL_OPTIONS.map((option) => (
              <ProfileSignalOptionCard
                key={option.type}
                option={option}
                active={option.type === selected}
                disabled={busy || Boolean(sentSignal)}
                onSelect={(next) => {
                  reset();
                  setSelected(next.type);
                }}
              />
            ))}
          </div>

          {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
          {sentSignal ? (
            <p className="rounded-xl bg-[var(--woody-nav)]/10 px-3 py-2 text-sm font-medium text-[var(--woody-nav)]" role="status">
              {`${sentSignal.label} ${sentSignal.emoji}`.trim()} enviado em privado.
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="min-h-10 rounded-xl">
                Fechar
              </Button>
            </DialogClose>
            <Button
              type="button"
              disabled={busy || Boolean(sentSignal)}
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
