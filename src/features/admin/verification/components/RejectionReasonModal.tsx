import { useState, useCallback } from "react";
import { Loader2, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const QUICK_SUGGESTIONS = [
  "Documento ilegível ou fora de foco",
  "Documento incompleto (dados cortados)",
  "Dados não correspondem ao cadastro",
  "Imagem com qualidade insuficiente",
  "Documento não aceito (não é RG)",
];

const MIN_LEN = 10;
const MAX_LEN = 500;

interface RejectionReasonModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (reason: string) => Promise<void>;
  username?: string;
}

export function RejectionReasonModal({
  open,
  onOpenChange,
  onConfirm,
  username,
}: RejectionReasonModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    setReason("");
    onOpenChange(false);
  }, [isSubmitting, onOpenChange]);

  const handleConfirm = useCallback(async () => {
    if (reason.trim().length < MIN_LEN || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm(reason.trim());
      setReason("");
    } finally {
      setIsSubmitting(false);
    }
  }, [reason, onConfirm, isSubmitting]);

  const applyQuickSuggestion = useCallback((suggestion: string) => {
    setReason((prev) => {
      const base = prev.trim();
      return base ? `${base} — ${suggestion}` : suggestion;
    });
  }, []);

  const trimmed = reason.trim();
  const charCount = trimmed.length;
  const isValid = charCount >= MIN_LEN && charCount <= MAX_LEN;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="size-5" aria-hidden />
            Recusar solicitação
          </DialogTitle>
          <DialogDescription>
            {username ? (
              <>
                Informe o motivo da recusa para{" "}
                <strong className="font-semibold text-[var(--woody-ink)]">@{username}</strong>.
                A utilizadora verá essa mensagem.
              </>
            ) : (
              "Informe o motivo da recusa. A utilizadora verá essa mensagem."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Sugestões rápidas */}
          <div>
            <p className="mb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">
              Sugestões rápidas
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => applyQuickSuggestion(s)}
                  disabled={isSubmitting}
                  className="rounded-full border border-black/12 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-600 hover:bg-zinc-100 hover:border-black/20 transition-colors disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="space-y-1">
            <label htmlFor="rejection-reason" className="text-sm font-medium text-[var(--woody-ink)]">
              Motivo da recusa{" "}
              <span className="text-red-500" aria-hidden>*</span>
            </label>
            <textarea
              id="rejection-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              rows={4}
              maxLength={MAX_LEN}
              placeholder="Descreva o motivo da recusa de forma clara e respeitosa…"
              className={cn(
                "w-full resize-none rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[var(--woody-ink)]",
                "placeholder:text-zinc-400 focus:outline-none focus:ring-2",
                charCount > 0 && charCount < MIN_LEN
                  ? "border-amber-300 focus:ring-amber-300/40"
                  : "border-black/15 focus:ring-[var(--auth-button)]/35",
                "disabled:opacity-50"
              )}
              aria-describedby="rejection-char-count"
            />
            <div
              id="rejection-char-count"
              className={cn(
                "flex justify-between text-xs",
                charCount > MAX_LEN * 0.9 ? "text-amber-600" : "text-zinc-400"
              )}
            >
              <span>
                {charCount < MIN_LEN && charCount > 0
                  ? `Mínimo ${MIN_LEN} caracteres`
                  : charCount === 0
                  ? `Mínimo ${MIN_LEN} caracteres obrigatório`
                  : ""}
              </span>
              <span>
                {charCount}/{MAX_LEN}
              </span>
            </div>
          </div>

          {/* Ações */}
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
                  Recusando…
                </>
              ) : (
                "Confirmar recusa"
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
