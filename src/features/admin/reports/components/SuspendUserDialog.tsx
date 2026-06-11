import { useState, useCallback } from "react";
import { Loader2, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { resolvePublicMediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  SUSPENSION_REASON_MAX_LENGTH,
  SUSPENSION_REASON_MIN_LENGTH,
  SUSPENSION_DURATION_OPTIONS,
  type ReportUserPreview,
} from "../services/adminReports.service";
import { getUserInitials } from "../utils/reportHelpers";

interface SuspendUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  author: ReportUserPreview;
  onConfirm: (payload: { reason: string; durationHours: number }) => Promise<void>;
}

export function SuspendUserDialog({
  open,
  onOpenChange,
  author,
  onConfirm,
}: SuspendUserDialogProps) {
  const [reason, setReason] = useState("");
  const [durationHours, setDurationHours] = useState(SUSPENSION_DURATION_OPTIONS[0].hours);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    setReason("");
    setDurationHours(SUSPENSION_DURATION_OPTIONS[0].hours);
    setError(null);
    onOpenChange(false);
  }, [isSubmitting, onOpenChange]);

  const handleConfirm = useCallback(async () => {
    const trimmed = reason.trim();
    if (trimmed.length < SUSPENSION_REASON_MIN_LENGTH || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm({ reason: trimmed, durationHours });
      setReason("");
      setDurationHours(SUSPENSION_DURATION_OPTIONS[0].hours);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível suspender esta conta.");
    } finally {
      setIsSubmitting(false);
    }
  }, [reason, durationHours, isSubmitting, onConfirm, onOpenChange]);

  const trimmed = reason.trim();
  const charCount = trimmed.length;
  const isValid =
    charCount >= SUSPENSION_REASON_MIN_LENGTH && charCount <= SUSPENSION_REASON_MAX_LENGTH;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose();
        else onOpenChange(true);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-700">
            <Clock className="size-5" aria-hidden />
            Suspender conta temporariamente?
          </DialogTitle>
          <DialogDescription>
            A conta e todo o conteúdo desta usuária (perfil, posts, comentários, etc.) ficam
            invisíveis para as demais usuárias durante o período da suspensão. As sessões ativas
            são encerradas e a conta é reativada automaticamente ao final do prazo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="flex items-center gap-3 rounded-lg border border-black/8 bg-zinc-50/80 px-3 py-2.5">
            <Avatar className="size-10">
              {author.avatarUrl && (
                <AvatarImage
                  src={resolvePublicMediaUrl(author.avatarUrl)}
                  alt={author.username}
                />
              )}
              <AvatarFallback className="text-xs bg-[var(--auth-button)]/15 text-[var(--auth-button-hover)]">
                {getUserInitials(author.name, author.username)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium text-sm text-[var(--woody-ink)] truncate">
                {author.name}
              </p>
              <p className="text-xs text-zinc-500">@{author.username}</p>
            </div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="suspend-duration"
              className="text-sm font-medium text-[var(--woody-ink)]"
            >
              Duração da suspensão
            </label>
            <select
              id="suspend-duration"
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-black/15 bg-white px-3.5 py-2.5 text-sm text-[var(--woody-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--auth-button)]/35 disabled:opacity-50"
            >
              {SUSPENSION_DURATION_OPTIONS.map((opt) => (
                <option key={opt.hours} value={opt.hours}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="suspend-reason"
              className="text-sm font-medium text-[var(--woody-ink)]"
            >
              Motivo da suspensão{" "}
              <span className="text-red-500" aria-hidden>
                *
              </span>
            </label>
            <textarea
              id="suspend-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              rows={4}
              maxLength={SUSPENSION_REASON_MAX_LENGTH}
              placeholder="Descreva o motivo da suspensão temporária…"
              className={cn(
                "w-full resize-none rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[var(--woody-ink)]",
                "placeholder:text-zinc-400 focus:outline-none focus:ring-2",
                charCount > 0 && charCount < SUSPENSION_REASON_MIN_LENGTH
                  ? "border-amber-300 focus:ring-amber-300/40"
                  : "border-black/15 focus:ring-[var(--auth-button)]/35",
                "disabled:opacity-50"
              )}
            />
            <div className="flex justify-between text-xs text-zinc-400">
              <span>
                {charCount > 0 && charCount < SUSPENSION_REASON_MIN_LENGTH
                  ? `Mínimo ${SUSPENSION_REASON_MIN_LENGTH} caracteres`
                  : charCount === 0
                    ? `Mínimo ${SUSPENSION_REASON_MIN_LENGTH} caracteres obrigatório`
                    : ""}
              </span>
              <span>
                {charCount}/{SUSPENSION_REASON_MAX_LENGTH}
              </span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-10 rounded-xl border border-black/15 px-4 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!isValid || isSubmitting}
              className={cn(
                "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold",
                "bg-amber-500 text-white hover:bg-amber-600",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Suspendendo…
                </>
              ) : (
                "Confirmar suspensão"
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
