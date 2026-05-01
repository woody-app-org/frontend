import { useCallback, useEffect, useId, useState } from "react";
import { Loader2, Search } from "lucide-react";
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

export interface GifStickerPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (item: StickerGifSearchItemDto) => void;
  onRequestLocalFile: () => void;
  disabled?: boolean;
}

export function GifStickerPickerDialog({
  open,
  onOpenChange,
  onPick,
  onRequestLocalFile,
  disabled,
}: GifStickerPickerDialogProps) {
  const idBase = useId();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<StickerGifSearchItemDto[]>([]);
  const [providerKey, setProviderKey] = useState<string | null>(null);

  const doSearch = useCallback(async (raw: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await searchMessagingStickerGifs(raw || undefined, 32);
      setItems(res.items ?? []);
      setProviderKey(res.providerKey ?? null);
    } catch (e) {
      setItems([]);
      setError(e instanceof Error ? e.message : "Erro ao pesquisar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setQ("");
      setError(null);
      setItems([]);
      setProviderKey(null);
      return;
    }
    const delay = q.trim() === "" ? 0 : 280;
    const t = window.setTimeout(() => void doSearch(q.trim()), delay);
    return () => window.clearTimeout(t);
  }, [open, q, doSearch]);

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
            Pesquisa no catálogo do servidor (provedor plugável). Toca num item para anexar antes de enviar.
            {providerKey ? (
              <span className="mt-1 block font-mono text-[0.65rem] opacity-90">Provider: {providerKey}</span>
            ) : null}
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
              placeholder="Pesquisar… (ex.: terra, smiley)"
              disabled={disabled || loading}
              className="h-10 rounded-xl border-[var(--woody-divider)] bg-[var(--woody-bg)] pl-9 pr-3 text-sm"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-[var(--woody-muted)]">
              <Loader2 className="size-8 animate-spin text-[var(--woody-nav)]" aria-hidden />
              A carregar…
            </div>
          ) : error ? (
            <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-800 dark:text-red-200">
              {error}
            </p>
          ) : items.length === 0 ? (
            <p className="py-12 text-center text-sm text-[var(--woody-muted)]">Sem resultados. Tenta outras palavras.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="listbox" aria-label="Resultados">
              {items.map((it) => (
                <li key={it.externalId} className="aspect-square min-w-0">
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
                      src={it.thumbnailUrl ?? it.url}
                      alt=""
                      className="size-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          className={cn(
            "flex shrink-0 flex-col gap-2 border-t border-[var(--woody-divider)]/80 px-3 py-3 sm:flex-row sm:px-4",
            "sm:justify-end"
          )}
        >
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl border-[var(--woody-divider)] sm:w-auto"
            onClick={() => {
              onOpenChange(false);
              onRequestLocalFile();
            }}
          >
            Carregar ficheiro local…
          </Button>
          <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
