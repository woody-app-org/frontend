import { useState, useCallback } from "react";
import { Loader2, ShieldBan } from "lucide-react";
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
  BAN_REASON_MAX_LENGTH,
  BAN_REASON_MIN_LENGTH,
  type ReportUserPreview,
} from "../services/adminReports.service";
import { getUserInitials } from "../utils/reportHelpers";

interface BanReportAuthorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  author: ReportUserPreview;
  onConfirm: (payload: { reason: string; internalNote?: string }) => Promise<void>;
}

export function BanReportAuthorDialog({
  open,
  onOpenChange,
  author,
  onConfirm,
}: BanReportAuthorDialogProps) {
  const [reason, setReason] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    setReason("");
    setInternalNote("");
    setError(null);
    onOpenChange(false);
  }, [isSubmitting, onOpenChange]);

  const handleConfirm = useCallback(async () => {
    const trimmed = reason.trim();
    if (trimmed.length < BAN_REASON_MIN_LENGTH || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm({
        reason: trimmed,
        internalNote: internalNote.trim() || undefined,
      });
      setReason("");
      setInternalNote("");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível banir esta conta.");
    } finally {
      setIsSubmitting(false);
    }
  }, [reason, internalNote, isSubmitting, onConfirm, onOpenChange]);

  const trimmed = reason.trim();
  const charCount = trimmed.length;
  const isValid =
    charCount >= BAN_REASON_MIN_LENGTH && charCount <= BAN_REASON_MAX_LENGTH;

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
          <DialogTitle className="flex items-center gap-2 text-red-700">
            <ShieldBan className="size-5" aria-hidden />
            Banir conta?
          </DialogTitle>
          <DialogDescription>
            Esta ação desativa o acesso da usuária à Woody e encerra suas sessões ativas. Use
            apenas quando houver violação das regras da plataforma.
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
              htmlFor="ban-reason"
              className="text-sm font-medium text-[var(--woody-ink)]"
            >
              Motivo do banimento{" "}
              <span className="text-red-500" aria-hidden>
                *
              </span>
            </label>
            <textarea
              id="ban-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              rows={4}
              maxLength={BAN_REASON_MAX_LENGTH}
              placeholder="Descreva o motivo do banimento…"
              className={cn(
                "w-full resize-none rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[var(--woody-ink)]",
                "placeholder:text-zinc-400 focus:outline-none focus:ring-2",
                charCount > 0 && charCount < BAN_REASON_MIN_LENGTH
                  ? "border-amber-300 focus:ring-amber-300/40"
                  : "border-black/15 focus:ring-[var(--auth-button)]/35",
                "disabled:opacity-50"
              )}
            />
            <div className="flex justify-between text-xs text-zinc-400">
              <span>
                {charCount > 0 && charCount < BAN_REASON_MIN_LENGTH
                  ? `Mínimo ${BAN_REASON_MIN_LENGTH} caracteres`
                  : charCount === 0
                    ? `Mínimo ${BAN_REASON_MIN_LENGTH} caracteres obrigatório`
                    : ""}
              </span>
              <span>
                {charCount}/{BAN_REASON_MAX_LENGTH}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="ban-internal-note"
              className="text-sm font-medium text-[var(--woody-ink)]"
            >
              Nota interna{" "}
              <span className="font-normal text-zinc-400">(opcional)</span>
            </label>
            <textarea
              id="ban-internal-note"
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              disabled={isSubmitting}
              rows={2}
              placeholder="Observações visíveis só para a equipe administrativa…"
              className="w-full resize-none rounded-xl border border-black/15 bg-white px-3.5 py-2.5 text-sm text-[var(--woody-ink)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--auth-button)]/35 disabled:opacity-50"
            />
            <p className="text-xs text-zinc-400">
              A nota interna ficará visível apenas para a equipe administrativa.
            </p>
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
                "bg-red-600 text-white hover:bg-red-700",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Banindo…
                </>
              ) : (
                "Confirmar banimento"
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
