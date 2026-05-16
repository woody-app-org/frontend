import { cn } from "@/lib/utils";

/** Emojis comuns para comentários (Unicode, sem dependências). */
export const COMMENT_FORM_DEFAULT_EMOJIS: readonly string[] = [
  "😀",
  "😅",
  "😂",
  "🥹",
  "🥰",
  "😍",
  "😘",
  "😉",
  "😊",
  "😎",
  "🔥",
  "💚",
  "❤️",
  "🧡",
  "💜",
  "✨",
  "🫶",
  "👀",
  "🙌",
  "👏",
  "🌈",
  "🌿",
  "☕",
  "📚",
  "🎧",
  "💬",
  "🫂",
  "🐱",
  "🐶",
  "⭐",
] as const;

export interface CommentEmojiPickerProps {
  open: boolean;
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
  /** `id` do painel para `aria-controls` no botão trigger. */
  panelId: string;
}

/**
 * Painel compacto de emojis para o composer de comentários.
 * O trigger e o posicionamento (`relative` + `absolute`) ficam no componente pai.
 */
export function CommentEmojiPicker({ open, onSelectEmoji, onClose, panelId }: CommentEmojiPickerProps) {
  if (!open) return null;

  return (
    <div
      id={panelId}
      role="dialog"
      aria-modal="false"
      aria-label="Emojis comuns"
      className={cn(
        "absolute bottom-full right-0 z-50 mb-1.5 w-max max-w-[calc(100vw-1rem)] overflow-x-auto",
        "rounded-xl border border-[var(--woody-accent)]/18 bg-[var(--woody-card)] p-2.5 shadow-lg",
        "ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
      )}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        className={cn(
          "grid gap-2",
          /* 6 colunas fixas tipo tabela — trilhas com mínimo > 0 para os emojis não se sobreporem */
          "[grid-template-columns:repeat(6,minmax(2.5rem,2.5rem))]",
          "[grid-auto-rows:minmax(2.5rem,auto)]",
          "sm:[grid-template-columns:repeat(6,minmax(2.75rem,2.75rem))]",
          "sm:[grid-auto-rows:minmax(2.75rem,auto)]"
        )}
        role="group"
        aria-label="Grade de emojis"
      >
        {COMMENT_FORM_DEFAULT_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className={cn(
              "box-border flex size-full min-h-[2.5rem] min-w-[2.5rem] items-center justify-center rounded-lg p-0",
              "text-[1.25rem] leading-none sm:min-h-[2.75rem] sm:min-w-[2.75rem] sm:text-[1.375rem]",
              "text-[var(--woody-text)] transition-colors",
              "hover:bg-[var(--woody-accent)]/12 active:bg-[var(--woody-accent)]/18",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/35"
            )}
            aria-label={`Inserir emoji ${emoji}`}
            onClick={() => {
              onSelectEmoji(emoji);
              onClose();
            }}
          >
            <span className="block select-none" aria-hidden>
              {emoji}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
