import { type KeyboardEvent, useCallback, useId, useState } from "react";
import { Hash, X } from "lucide-react";
import { Input } from "@/components/ui/input";
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
}

export function HashtagChipsField({ hashtags, onHashtagsChange, disabled, className }: HashtagChipsFieldProps) {
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
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[var(--woody-muted)]">Hashtags</span>
        <span className="text-[0.65rem] tabular-nums text-[var(--woody-muted)]">
          {hashtags.length}/{POST_COMPOSER_HASHTAGS_MAX}
        </span>
      </div>

      {hashtags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {hashtags.map((t) => (
            <span
              key={t}
              className="inline-flex max-w-full items-center gap-1 rounded-full bg-[var(--woody-nav)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--woody-nav)] ring-1 ring-[var(--woody-nav)]/15"
            >
              <span className="truncate">#{t}</span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => remove(t)}
                className="rounded-full p-0.5 text-[var(--woody-nav)]/70 hover:bg-[var(--woody-nav)]/15 hover:text-[var(--woody-text)] disabled:opacity-40"
                aria-label={`Remover hashtag ${t}`}
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {hashtags.length < POST_COMPOSER_HASHTAGS_MAX ? (
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Hash
              className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--woody-muted)]"
              aria-hidden
            />
            <Input
              id={`${baseId}-hashtag-draft`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              onBlur={() => {
                if (draft.trim()) commitDraft();
              }}
              disabled={disabled}
              placeholder="Adicionar hashtag"
              className="h-9 rounded-xl border-[var(--woody-accent)]/18 bg-[var(--woody-bg)] pl-8 text-sm"
              autoComplete="off"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 shrink-0 rounded-xl text-[var(--woody-nav)] hover:bg-[var(--woody-nav)]/10"
            disabled={disabled || !draft.trim()}
            onClick={() => commitDraft()}
          >
            Adicionar
          </Button>
        </div>
      ) : null}
    </div>
  );
}
