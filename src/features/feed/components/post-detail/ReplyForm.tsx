import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CommentGifDraft } from "@/domain/types";
import { CommentForm } from "./CommentForm";

export interface ReplyFormProps {
  parentCommentId: string;
  parentAuthorName: string;
  onSubmit: (body: string, parentCommentId: string, gif?: CommentGifDraft | null) => Promise<boolean>;
  onCancel: () => void;
  isSubmitting: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

/**
 * Formulário de resposta a um comentário; reutiliza `CommentForm` + cancelar.
 * TODO(backend): manter assinatura; trocar `onSubmit` por mutação HTTP.
 */
export function ReplyForm({
  parentCommentId,
  parentAuthorName,
  onSubmit,
  onCancel,
  isSubmitting,
  disabled = false,
  autoFocus = true,
  className,
}: ReplyFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [body, setBody] = useState("");

  useEffect(() => {
    if (!autoFocus) return;
    const t = window.requestAnimationFrame(() => textareaRef.current?.focus());
    return () => window.cancelAnimationFrame(t);
  }, [autoFocus, parentCommentId]);

  const handleSubmit = async (payload: { text: string; gif: CommentGifDraft | null }) => {
    const ok = await onSubmit(payload.text, parentCommentId, payload.gif);
    if (ok) setBody("");
    return ok;
  };

  const fieldId = `reply-to-${parentCommentId}`;

  return (
    <CommentForm
      id={fieldId}
      className={cn(className)}
      value={body}
      onChange={setBody}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      disabled={disabled}
      placeholder={`Responder a ${parentAuthorName}…`}
      submitLabel="Responder"
      rows={2}
      textareaRef={(el) => {
        textareaRef.current = el;
      }}
      footerStart={
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isSubmitting}
          onClick={onCancel}
          className={cn(
            "h-8 text-[var(--woody-muted)] hover:text-[var(--woody-text)]",
            "transition-colors duration-200"
          )}
        >
          Cancelar
        </Button>
      }
    />
  );
}
