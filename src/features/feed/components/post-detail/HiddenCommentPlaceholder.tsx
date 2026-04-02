import { EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { HIDDEN_COMMENT_PLACEHOLDER } from "@/domain/lib/contentModerationDisplay";

export interface HiddenCommentPlaceholderProps {
  /** Alinha tipografia ao `CommentItem` (raiz vs resposta). */
  nested?: boolean;
  className?: string;
}

/**
 * Corpo substituto quando o comentário está oculto para a leitora atual (mock / futura API).
 */
export function HiddenCommentPlaceholder({ nested = false, className }: HiddenCommentPlaceholderProps) {
  return (
    <p
      role="note"
      className={cn(
        "mt-1.5 flex gap-2 rounded-lg border border-[var(--woody-accent)]/12 bg-[var(--woody-nav)]/5 px-3 py-2 leading-relaxed [overflow-wrap:anywhere]",
        "text-[var(--woody-muted)] italic",
        nested ? "text-[0.8125rem] sm:text-[0.875rem]" : "text-[0.875rem] sm:text-[0.9375rem]",
        className
      )}
    >
      <EyeOff className="mt-0.5 size-3.5 shrink-0 opacity-70" aria-hidden />
      <span>{HIDDEN_COMMENT_PLACEHOLDER}</span>
    </p>
  );
}
