import type { ReactNode, RefObject } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface CommentFormProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  disabled?: boolean;
  placeholder?: string;
  submitLabel?: string;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
  /** Conteúdo à esquerda da linha de ações (ex.: cancelar resposta). */
  footerStart?: ReactNode;
  onTextareaFocus?: () => void;
  rows?: number;
  className?: string;
}

export function CommentForm({
  id = "post-comment-field",
  value,
  onChange,
  onSubmit,
  isSubmitting,
  disabled = false,
  placeholder = "Escreva um comentário…",
  submitLabel = "Publicar",
  textareaRef,
  footerStart,
  onTextareaFocus,
  rows = 3,
  className,
}: CommentFormProps) {
  const canSubmit = value.trim().length > 0 && !isSubmitting && !disabled;

  return (
    <form
      className={cn("space-y-3", className)}
      aria-busy={isSubmitting}
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit();
      }}
    >
      <Textarea
        ref={textareaRef}
        id={id}
        name="comment"
        placeholder={placeholder}
        value={value}
        disabled={disabled || isSubmitting}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => onTextareaFocus?.()}
        rows={rows}
        className={cn(
          "min-h-[88px] resize-y rounded-xl border-[var(--woody-accent)]/18 bg-[var(--woody-card)]",
          "text-[var(--woody-text)] placeholder:text-[var(--woody-muted)]/80",
          "shadow-none transition-[box-shadow,border-color] duration-200",
          "focus-visible:border-[var(--woody-accent)]/35 focus-visible:ring-[var(--woody-accent)]/20"
        )}
        aria-label="Texto do comentário"
      />
      <div
        className={cn(
          "flex flex-wrap items-center gap-2",
          footerStart ? "justify-between" : "justify-end"
        )}
      >
        {footerStart ? <div className="flex shrink-0 items-center gap-2">{footerStart}</div> : null}
        <Button
          type="submit"
          size="sm"
          disabled={!canSubmit}
          className={cn(
            "gap-1.5 bg-[var(--woody-accent)] text-white shadow-sm",
            "transition-[transform,opacity,box-shadow] duration-200 hover:bg-[var(--woody-accent)]/92",
            "active:scale-[0.98] disabled:active:scale-100",
            "focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/35"
          )}
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              Enviando…
            </span>
          ) : (
            <>
              <Send className="size-3.5" aria-hidden />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
