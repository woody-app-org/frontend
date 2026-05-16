import { cn } from "@/lib/utils";

/** Alinhado a `CreatePostCard` — reutilizado no fluxo de edição de post. */
export const postComposerFieldStyles = {
  input: cn(
    "h-11 rounded-xl border border-[var(--woody-accent)]/20 bg-[var(--woody-bg)] text-[var(--woody-text)]",
    "placeholder:text-[var(--woody-muted)] focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/20",
    "focus-visible:border-[var(--woody-accent)]/30 transition-colors"
  ),
  textarea: cn(
    "min-h-[140px] resize-y rounded-xl border border-[var(--woody-accent)]/20 bg-[var(--woody-bg)] text-[var(--woody-text)]",
    "placeholder:text-[var(--woody-muted)] leading-relaxed focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/20",
    "focus-visible:border-[var(--woody-accent)]/30 transition-colors sm:min-h-[160px]"
  ),
} as const;
