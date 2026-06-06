import type { ReactNode, RefCallback } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Send, Smile, Sticker, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { CommentGifDraft } from "@/domain/types";
import { GifStickerPickerDialog } from "@/features/messages/components/GifStickerPickerDialog";
import type { StickerGifSearchItemDto } from "@/features/messages/types";
import { showErrorToast } from "@/lib/toast";
import { CommentEmojiPicker } from "./CommentEmojiPicker";
import { COMMENT_CONTENT_MAX_LENGTH } from "../../services/post.service";

export interface CommentFormProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  /** Devolve `true` se o comentário foi aceite (limpa GIF interno). */
  onSubmit: (payload: { text: string; gif: CommentGifDraft | null }) => Promise<boolean>;
  isSubmitting: boolean;
  disabled?: boolean;
  placeholder?: string;
  submitLabel?: string;
  /** Callback de ref do textarea no pai: `(el) => { myRef.current = el }`. */
  textareaRef?: RefCallback<HTMLTextAreaElement | null>;
  /** Conteúdo à esquerda da linha de ações (ex.: cancelar resposta). */
  footerStart?: ReactNode;
  onTextareaFocus?: () => void;
  rows?: number;
  className?: string;
}

function stickerItemToCommentGif(item: StickerGifSearchItemDto): CommentGifDraft | null {
  const url = item.url.trim();
  if (!url.toLowerCase().endsWith(".gif")) return null;
  return {
    gifUrl: url,
    gifThumbnailUrl: item.thumbnailUrl?.trim() || undefined,
    gifProvider: item.provider.trim(),
    gifExternalId: item.externalId.trim(),
    gifTitle: item.title.trim() || undefined,
  };
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
  const [draftGif, setDraftGif] = useState<CommentGifDraft | null>(null);
  const [gifPickerOpen, setGifPickerOpen] = useState(false);
  const [emojiPopoverOpen, setEmojiPopoverOpen] = useState(false);

  const localTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const emojiPopoverWrapRef = useRef<HTMLDivElement | null>(null);
  const emojiPanelId = `${id}-emoji-panel`;

  const assignTextareaRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      localTextareaRef.current = node;
      textareaRef?.(node);
    },
    [textareaRef]
  );

  const closeEmojiPopover = useCallback(() => setEmojiPopoverOpen(false), []);

  const insertEmojiAtCursor = useCallback(
    (emoji: string) => {
      const el = localTextareaRef.current;
      if (!el || disabled || isSubmitting) return;
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;
      const next = value.slice(0, start) + emoji + value.slice(end);
      onChange(next);
      const pos = start + emoji.length;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.focus();
          try {
            el.setSelectionRange(pos, pos);
          } catch {
            /* alguns browsers em edge cases */
          }
        });
      });
    },
    [value, onChange, disabled, isSubmitting]
  );

  useEffect(() => {
    if (!emojiPopoverOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const wrap = emojiPopoverWrapRef.current;
      if (wrap && !wrap.contains(e.target as Node)) closeEmojiPopover();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeEmojiPopover();
      }
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [emojiPopoverOpen, closeEmojiPopover]);

  /** Picker de emojis só em desktop (≥768px, Tailwind `md`): no telemóvel o teclado já traz emojis. */
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => {
      if (!mq.matches) setEmojiPopoverOpen(false);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const trimmed = value.trim();
  const hasGif = draftGif != null && draftGif.gifUrl.length > 0;
  const overLimit = trimmed.length > COMMENT_CONTENT_MAX_LENGTH;
  const charsLeft = COMMENT_CONTENT_MAX_LENGTH - trimmed.length;
  const canSubmit = (trimmed.length > 0 || hasGif) && !isSubmitting && !disabled && !overLimit;

  const onGifPick = useCallback((item: StickerGifSearchItemDto) => {
    const mapped = stickerItemToCommentGif(item);
    if (!mapped) {
      showErrorToast("Para comentários só são aceites GIF animados (.gif).", {
        id: "woody-comment-gif-type",
      });
      return;
    }
    setDraftGif(mapped);
  }, []);

  return (
    <>
      <form
        className={cn("space-y-3", className)}
        aria-busy={isSubmitting}
        onSubmit={async (e) => {
          e.preventDefault();
          if (!canSubmit) return;
          const ok = await onSubmit({ text: value, gif: draftGif });
          if (ok) {
            setDraftGif(null);
            closeEmojiPopover();
          }
        }}
      >
        <Textarea
          ref={assignTextareaRef}
          id={id}
          name="comment"
          placeholder={placeholder}
          value={value}
          disabled={disabled || isSubmitting}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => onTextareaFocus?.()}
          rows={rows}
          className={cn(
            "min-h-[88px] resize-none rounded-xl border-transparent bg-transparent",
            "text-[var(--woody-text)] placeholder:text-[var(--woody-muted)]/80",
            "shadow-none transition-[box-shadow] duration-200",
            "focus-visible:border-transparent focus-visible:ring-0"
          )}
          aria-label="Texto do comentário"
        />

        {draftGif ? (
          <div
            className={cn(
              "flex max-w-[240px] flex-col gap-1.5 rounded-xl border border-[var(--woody-accent)]/14",
              "bg-[var(--woody-nav)]/[0.06] p-2"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[0.65rem] font-medium uppercase tracking-wide text-[var(--woody-muted)]">
                GIF selecionado
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 text-[var(--woody-muted)] hover:text-[var(--woody-text)]"
                onClick={() => setDraftGif(null)}
                disabled={isSubmitting || disabled}
                aria-label="Remover GIF do comentário"
              >
                <X className="size-3.5" aria-hidden />
              </Button>
            </div>
            <img
              src={draftGif.gifThumbnailUrl || draftGif.gifUrl}
              alt=""
              className="max-h-[120px] w-full max-w-[220px] rounded-lg object-contain"
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </div>
        ) : null}

        <div className={cn("flex flex-wrap items-center gap-2", footerStart ? "justify-between" : "justify-end")}>
          {footerStart ? <div className="flex shrink-0 items-center gap-2">{footerStart}</div> : null}
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {trimmed.length > 0 ? (
              <span className={cn(
                "text-xs tabular-nums text-[var(--woody-muted)]",
                charsLeft < 50 && "text-amber-500",
                overLimit && "font-semibold text-red-500"
              )}>
                {charsLeft}
              </span>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || isSubmitting}
              onClick={() => setGifPickerOpen(true)}
              className={cn(
                "h-8 gap-1 px-2 text-[var(--woody-muted)] hover:text-[var(--woody-text)]",
                hasGif && "text-[var(--woody-accent)]"
              )}
              aria-label="Escolher GIF"
            >
              <Sticker className="size-3.5" aria-hidden />
              <span className="hidden text-xs sm:inline">GIF</span>
            </Button>
            <div className="relative hidden shrink-0 md:block" ref={emojiPopoverWrapRef}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled || isSubmitting}
                onClick={(ev) => {
                  ev.stopPropagation();
                  setEmojiPopoverOpen((o) => !o);
                }}
                aria-label="Abrir seletor de emojis"
                aria-expanded={emojiPopoverOpen}
                aria-haspopup="dialog"
                aria-controls={emojiPanelId}
                className={cn(
                  "h-8 gap-1 px-2 text-[var(--woody-muted)] hover:text-[var(--woody-text)]",
                  emojiPopoverOpen && "bg-[var(--woody-accent)]/12 text-[var(--woody-text)]"
                )}
              >
                <Smile className="size-3.5" aria-hidden />
                <span className="hidden text-xs sm:inline">Emoji</span>
              </Button>
              <CommentEmojiPicker
                open={emojiPopoverOpen}
                panelId={emojiPanelId}
                onSelectEmoji={insertEmojiAtCursor}
                onClose={closeEmojiPopover}
              />
            </div>
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
        </div>
      </form>

      <GifStickerPickerDialog
        open={gifPickerOpen}
        onOpenChange={setGifPickerOpen}
        onPick={onGifPick}
        disabled={disabled || isSubmitting}
      />
    </>
  );
}
