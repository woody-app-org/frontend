import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import type { CommentGifDraft } from "@/domain/types";
import { CommentForm } from "./CommentForm";

export type CommentComposerMode = "comment" | "reply";

export interface CommentComposerModalContext {
  /** Username do autor do comentário pai (para modo reply). */
  authorUsername?: string;
  /** Trecho de texto do comentário pai (para contexto visual). */
  textPreview?: string;
}

export interface CommentComposerModalProps {
  open: boolean;
  mode: CommentComposerMode;
  isSubmitting: boolean;
  context?: CommentComposerModalContext;
  onSubmit: (body: string, gif?: CommentGifDraft | null) => Promise<boolean>;
  onClose: () => void;
}

export function CommentComposerModal({
  open,
  mode,
  isSubmitting,
  context,
  onSubmit,
  onClose,
}: CommentComposerModalProps) {
  const viewer = useCurrentUser();
  const [body, setBody] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Foca o textarea quando o modal abre
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 80);
    return () => window.clearTimeout(t);
  }, [open]);

  // Reset + fechar — usado tanto no X quanto no onOpenChange do Dialog
  const handleClose = () => {
    setBody("");
    onClose();
  };

  const handleSubmit = async (payload: { text: string; gif: CommentGifDraft | null }) => {
    const ok = await onSubmit(payload.text, payload.gif);
    if (ok) {
      setBody("");
      onClose();
    }
    return ok;
  };

  const isReply = mode === "reply";
  const placeholder = isReply ? "Poste sua resposta" : "O que você acha?";
  const submitLabel = isReply ? "Responder" : "Comentar";
  const viewerInitials = (viewer?.username ?? viewer?.name ?? "?").slice(0, 2).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent
        className="max-w-[min(560px,calc(100vw-1rem))] p-0 gap-0 overflow-hidden"
        overlayClassName="bg-black/60 backdrop-blur-[3px]"
        aria-label={isReply ? "Responder comentário" : "Escrever comentário"}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--woody-accent)]/10">
          <span className="text-sm font-semibold text-[var(--woody-text)]">
            {isReply ? "Responder" : "Novo comentário"}
          </span>
          <DialogClose asChild>
            <button
              type="button"
              className="rounded-full p-1.5 text-[var(--woody-muted)] hover:bg-[var(--woody-nav)]/10 hover:text-[var(--woody-text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/30"
              aria-label="Fechar"
              onClick={handleClose}
            >
              <X className="size-4" aria-hidden />
            </button>
          </DialogClose>
        </div>

        {/* Contexto do comentário pai (apenas no modo reply) */}
        {isReply && context?.authorUsername ? (
          <div className="px-4 pt-3 pb-2">
            <p className="text-xs text-[var(--woody-muted)] mb-1">
              Respondendo a{" "}
              <span className="font-semibold text-[var(--woody-accent)]">@{context.authorUsername}</span>
            </p>
            {context.textPreview ? (
              <p className="text-sm text-[var(--woody-muted)]/80 line-clamp-2 border-l-2 border-[var(--woody-accent)]/25 pl-3 italic">
                {context.textPreview}
              </p>
            ) : null}
          </div>
        ) : null}

        {/* Área do composer: avatar + form */}
        <div className="flex items-start gap-3 px-4 pt-3 pb-4">
          <Avatar size="default" className="size-9 shrink-0 mt-0.5 ring-0">
            <AvatarImage src={viewer?.avatarUrl ?? undefined} alt={viewer?.username ?? ""} className="block" />
            <AvatarFallback className="bg-[var(--woody-nav)]/10 text-[var(--woody-text)] text-xs">
              {viewerInitials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <CommentForm
              id="comment-composer-modal-field"
              value={body}
              onChange={setBody}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              placeholder={placeholder}
              submitLabel={submitLabel}
              textareaRef={(el) => { textareaRef.current = el; }}
              rows={4}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
