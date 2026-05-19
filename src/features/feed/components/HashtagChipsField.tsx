import { type KeyboardEvent, useCallback, useId, useState } from "react";
import { Hash, X } from "lucide-react";
import { HandleInput } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { showInfoToast, showWarningToast } from "@/lib/toast";
import {
  POST_COMPOSER_HASHTAGS_MAX,
  POST_COMPOSER_HASHTAG_MAX_LENGTH,
  parseHashtagInput,
} from "../lib/postComposerHashtags";

export interface HashtagChipsFieldProps {
  hashtags: string[];
  onHashtagsChange: (next: string[]) => void;
  disabled?: boolean;
  className?: string;
  /** Estilo leve para compositores estilo rede social (menos “formulário”). */
  compact?: boolean;
  /** Sem caixa cinzenta nem botão “Adicionar”: campo de hashtag minimalista (ex.: modal). */
  composerBare?: boolean;
}

export function HashtagChipsField({
  hashtags,
  onHashtagsChange,
  disabled,
  className,
  compact = false,
  composerBare = false,
}: HashtagChipsFieldProps) {
  const baseId = useId();
  const [draft, setDraft] = useState("");

  const commitDraft = useCallback(() => {
    const parsed = parseHashtagInput(draft);
    if (!parsed.ok) {
      if (parsed.kind === "empty") {
        setDraft("");
        return;
      }
      if (parsed.kind === "inner_hash") {
        showWarningToast("Cada hashtag não pode ter # no meio do texto.");
        return;
      }
      if (parsed.kind === "too_long") {
        showWarningToast(`Cada hashtag: no máximo ${POST_COMPOSER_HASHTAG_MAX_LENGTH} caracteres.`);
        return;
      }
      return;
    }

    const value = parsed.value;
    const key = value.toLowerCase();
    if (hashtags.some((t) => t.toLowerCase() === key)) {
      showInfoToast("Esta hashtag já está na lista.");
      setDraft("");
      return;
    }
    if (hashtags.length >= POST_COMPOSER_HASHTAGS_MAX) {
      showWarningToast(`No máximo ${POST_COMPOSER_HASHTAGS_MAX} hashtags por publicação.`);
      return;
    }
    onHashtagsChange([...hashtags, value]);
    setDraft("");
  }, [draft, hashtags, onHashtagsChange]);

  const remove = useCallback(
    (tag: string) => {
      onHashtagsChange(hashtags.filter((t) => t !== tag));
    },
    [hashtags, onHashtagsChange]
  );

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
    }
  };

  return (
    <div className={cn(composerBare ? "space-y-1" : compact ? "space-y-1.5" : "space-y-2", className)}>
      <div className={cn("flex items-center justify-between gap-2", (compact || composerBare) && "sr-only")}>
        <span className="text-xs font-medium text-[var(--woody-muted)]">Hashtags</span>
        <span className="text-[0.65rem] tabular-nums text-[var(--woody-muted)]">
          {hashtags.length}/{POST_COMPOSER_HASHTAGS_MAX}
        </span>
      </div>
      {hashtags.length > 0 ? (
        <div className={cn("flex flex-wrap", compact || composerBare ? "gap-1" : "gap-1.5")}>
          {hashtags.map((t) => (
            <span
              key={t}
              className={cn(
                "inline-flex max-w-full items-center gap-0.5 rounded-full font-medium",
                compact || composerBare
                  ? "bg-black/[0.04] px-2 py-0.5 text-[0.72rem] text-[var(--woody-text)]/90 ring-1 ring-black/[0.07]"
                  : "gap-1 bg-[var(--woody-nav)]/10 px-2.5 py-0.5 text-xs text-[var(--woody-nav)] ring-1 ring-[var(--woody-nav)]/15"
              )}
            >
              <span className="truncate">#{t}</span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => remove(t)}
                className={cn(
                  "rounded-full p-0.5 disabled:opacity-40",
                  compact || composerBare
                    ? "text-[var(--woody-muted)] hover:bg-black/[0.06] hover:text-[var(--woody-text)]"
                    : "text-[var(--woody-nav)]/70 hover:bg-[var(--woody-nav)]/15 hover:text-[var(--woody-text)]"
                )}
                aria-label={`Remover hashtag ${t}`}
              >
                <X className={compact || composerBare ? "size-3" : "size-3.5"} aria-hidden />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {hashtags.length < POST_COMPOSER_HASHTAGS_MAX ? (
        composerBare ? (
          <div className="flex min-h-[1.75rem] flex-wrap items-center gap-x-2 gap-y-1">
            <HandleInput
              id={`${baseId}-hashtag-draft`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              onBlur={() => {
                if (draft.trim()) commitDraft();
              }}
              disabled={disabled}
              placeholder="Adicionar hashtag"
              aria-label="Adicionar hashtag (Enter para confirmar)"
              className="h-8 min-w-[10rem] flex-1 border-0 bg-transparent px-0 py-0 text-[0.8125rem] text-[var(--woody-text)] shadow-none ring-0 placeholder:text-[var(--woody-muted)]/75 outline-none focus-visible:ring-0"
            />
          </div>
        ) : (
        <div
          className={cn(
            "flex flex-col gap-1.5",
            !compact && "sm:flex-row sm:items-center",
            compact && "sm:flex-row sm:items-center sm:gap-2"
          )}
        >
          <div className="relative min-w-0 flex-1">
            <Hash
              className={cn(
                "pointer-events-none absolute top-1/2 -translate-y-1/2 text-[var(--woody-muted)]",
                compact ? "left-2 size-3" : "left-2.5 size-3.5"
              )}
              aria-hidden
            />
            <HandleInput
              id={`${baseId}-hashtag-draft`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              onBlur={() => {
                if (draft.trim()) commitDraft();
              }}
              disabled={disabled}
              placeholder={compact ? "Hashtag — Enter" : "Adicionar hashtag"}
              className={cn(
                compact ? "pl-7" : "pl-8",
                "text-sm",
                compact
                  ? "h-8 rounded-xl border-0 bg-black/[0.035] shadow-none ring-0 placeholder:text-[var(--woody-muted)]/75 focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/22"
                  : "h-9 rounded-xl border-[var(--woody-accent)]/18 bg-[var(--woody-bg)]"
              )}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "shrink-0 rounded-xl text-[var(--woody-nav)] hover:bg-[var(--woody-nav)]/10",
              compact ? "h-8 !min-h-8 text-xs font-medium text-[var(--woody-muted)] hover:text-[var(--woody-nav)]" : "h-9"
            )}
            disabled={disabled || !draft.trim()}
            onClick={() => commitDraft()}
          >
            Adicionar
          </Button>
        </div>
        )
      ) : null}
    </div>
  );
}
