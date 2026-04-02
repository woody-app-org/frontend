import { cn } from "@/lib/utils";
import { COMMENT_THREAD_ACTION_INDENT } from "./commentThreadLayout";
import { ReplyForm } from "./ReplyForm";

export interface ReplyComposerProps {
  parentCommentId: string;
  parentAuthorName: string;
  onSubmit: (body: string) => Promise<boolean>;
  onCancel: () => void;
  isSubmitting: boolean;
  disabled?: boolean;
  /** Quando já dentro de um bloco com `COMMENT_THREAD_ACTION_INDENT`. */
  omitActionIndent?: boolean;
  className?: string;
}

/**
 * Área de resposta ancorada ao comentário pai (linha guia + fundo discreto).
 */
export function ReplyComposer({
  parentCommentId,
  parentAuthorName,
  onSubmit,
  onCancel,
  isSubmitting,
  disabled = false,
  omitActionIndent = false,
  className,
}: ReplyComposerProps) {
  return (
    <div
      className={cn(
        !omitActionIndent && COMMENT_THREAD_ACTION_INDENT,
        "mt-2 min-w-0 max-w-full",
        "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200",
        className
      )}
    >
      <div
        className={cn(
          "rounded-xl border border-[var(--woody-accent)]/10 border-l-[3px] border-l-[var(--woody-accent)]/26",
          "bg-[var(--woody-nav)]/[0.06] py-2.5 pl-2.5 pr-2 sm:py-3 sm:pl-3.5 sm:pr-3",
          "shadow-sm transition-[box-shadow,border-color] duration-200"
        )}
      >
        <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-wide text-[var(--woody-muted)]">
          Respondendo a{" "}
          <span className="normal-case text-[var(--woody-text)]/90">{parentAuthorName}</span>
        </p>
        <ReplyForm
          parentCommentId={parentCommentId}
          parentAuthorName={parentAuthorName}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
