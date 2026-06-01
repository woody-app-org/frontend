import axios from "axios";
import { useCallback, useEffect, useId, useLayoutEffect, useState } from "react";
import { Loader2, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import type { StickerGifSearchItemDto } from "../types";
import { searchMessagingStickerGifs } from "../services/stickerGifSearch.service";

const SEARCH_DEBOUNCE_MS = 320;
const RESULT_LIMIT = 32;

const MSG_EMPTY = "Nenhum resultado encontrado.";
const MSG_ERROR = "Não foi possível carregar GIFs agora.";

export interface GifStickerPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (item: StickerGifSearchItemDto) => void;
  onRequestLocalFile: () => void;
  disabled?: boolean;
}

function GifStickerSkeletonGrid({ cellCount = 12 }: { cellCount?: number }) {
  return (
    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-2.5" aria-hidden>
      {Array.from({ length: cellCount }).map((_, i) => (
        <li key={i} className="aspect-square min-h-[5.25rem] min-w-0 sm:min-h-0">
          <div
            className={cn(
              "size-full rounded-xl bg-[var(--woody-divider)]/40 ring-1 ring-[var(--woody-divider)]/45",
              "animate-pulse motion-reduce:animate-none"
            )}
          />
        </li>
      ))}
    </ul>
  );
}

export function GifStickerPickerDialog({
  open,
  onOpenChange,
  onPick,
  disabled,
}: GifStickerPickerDialogProps) {
  const idBase = useId();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<StickerGifSearchItemDto[]>([]);

  const runSearch = useCallback(async (trimmedQuery: string, signal: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await searchMessagingStickerGifs(
        trimmedQuery || undefined,
        RESULT_LIMIT,
        signal
      );
      if (signal.aborted) return;
      setItems(res.items ?? []);
    } catch (e) {
      if (axios.isCancel(e)) return;
      if (signal.aborted) return;
      setItems([]);
      setError(MSG_ERROR);
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, []);

  useLayoutEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQ("");
      setError(null);
      setItems([]);
      setLoading(false);
      return;
    }

    const trimmed = q.trim();
    const delay = trimmed === "" ? 0 : SEARCH_DEBOUNCE_MS;
    const controller = new AbortController();

    const tid = window.setTimeout(() => {
      void runSearch(trimmed, controller.signal);
    }, delay);

    return () => {
      window.clearTimeout(tid);
      controller.abort();
    };
  }, [open, q, runSearch]);

  const previewSrc = (it: StickerGifSearchItemDto) =>
    (it.thumbnailUrl && it.thumbnailUrl.trim()) || it.url;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[min(88dvh,640px)] w-[calc(100vw-1rem)] max-w-lg flex-col gap-0 overflow-hidden p-0",
          "border-[var(--woody-divider)] bg-[var(--woody-card)] sm:max-w-xl"
        )}
        aria-describedby={`${idBase}-desc`}
      >
        <DialogHeader className="shrink-0 border-b border-[var(--woody-divider)]/80 px-4 py-3 sm:px-5">
          <DialogTitle className="text-[var(--woody-text)]">GIF e stickers</DialogTitle>
          <DialogDescription id={`${idBase}-desc`} className="text-xs text-[var(--woody-muted)]">
            Escolhe um GIF ou sticker para anexar à mensagem antes de enviar.
          </DialogDescription>
        </DialogHeader>

        <div className="shrink-0 border-b border-[var(--woody-divider)]/60 px-3 py-2 sm:px-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--woody-muted)]"
              aria-hidden
            />
            <Input
              id={`${idBase}-q`}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pesquisar ou ver populares…"
              disabled={disabled}
              className="h-10 rounded-xl border-[var(--woody-divider)] bg-[var(--woody-bg)] pl-9 pr-3 text-sm"
              autoComplete="off"
              enterKeyHint="search"
            />
          </div>
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4"
          aria-busy={loading}
        >
          {loading ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[var(--woody-divider)]/60 bg-[var(--woody-bg)]/40 px-4 py-5 text-center">
                <div className="flex items-center gap-2 text-sm font-medium text-[var(--woody-text)]">
                  <Sparkles className="size-4 shrink-0 text-[var(--woody-nav)]" aria-hidden />
                  Carregando pré-visualizações…
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--woody-muted)]">
                  <Loader2 className="size-4 animate-spin text-[var(--woody-nav)]" aria-hidden />
                  <span>{q.trim() ? "Pesquisando na biblioteca…" : "Carregando tendências…"}</span>
                </div>
              </div>
              <GifStickerSkeletonGrid cellCount={12} />
            </div>
          ) : error ? (
            <div
              role="alert"
              className="rounded-xl border border-red-500/25 bg-red-500/[0.08] px-4 py-6 text-center"
            >
              <p className="text-sm font-medium leading-snug text-red-900 dark:text-red-100">
                {MSG_ERROR}
              </p>
            </div>
          ) : items.length === 0 ? (
            <p className="py-14 text-center text-sm text-[var(--woody-muted)]">{MSG_EMPTY}</p>
          ) : (
            <ul
              className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-2.5"
              role="listbox"
              aria-label="Resultados"
            >
              {items.map((it) => (
                <li key={it.externalId} className="aspect-square min-h-[5.25rem] min-w-0 sm:min-h-0">
                  <button
                    type="button"
                    disabled={disabled}
                    title={it.title}
                    className={cn(
                      woodyFocus.ring,
                      "size-full overflow-hidden rounded-xl ring-1 ring-[var(--woody-divider)]/80 transition-transform active:scale-[0.98] disabled:opacity-50",
                      "hover:ring-[var(--woody-nav)]/35"
                    )}
                    onClick={() => {
                      onPick(it);
                      onOpenChange(false);
                    }}
                  >
                    <img
                      src={previewSrc(it)}
                      alt=""
                      className={cn(
                        "size-full",
                        it.mediaType === "sticker"
                          ? "bg-black/[0.04] object-contain dark:bg-white/[0.06]"
                          : "object-cover"
                      )}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex shrink-0 justify-end border-t border-[var(--woody-divider)]/80 px-3 py-3 sm:px-4">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
