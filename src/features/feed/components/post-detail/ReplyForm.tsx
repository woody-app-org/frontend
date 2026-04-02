import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CommentForm } from "./CommentForm";

export interface ReplyFormProps {
  parentCommentId: string;
  parentAuthorName: string;
  onSubmit: (body: string) => Promise<boolean>;
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

  const handleSubmit = async () => {
    const text = body.trim();
    if (!text) return;
    const ok = await onSubmit(text);
    if (ok) setBody("");
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
      textareaRef={textareaRef}
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
