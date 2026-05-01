"use client";

import { useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { PostMediaAttachment } from "@/domain/mediaAttachment";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PostMediaItem } from "./PostMediaRenderer";

export interface PostMediaLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: PostMediaAttachment[];
  index: number;
  onIndexChange: (i: number) => void;
  variant: "feed" | "detail";
}

export function PostMediaLightbox({
  open,
  onOpenChange,
  items,
  index,
  onIndexChange,
  variant,
}: PostMediaLightboxProps) {
  const safeIndex = Math.min(Math.max(0, index), Math.max(0, items.length - 1));
  const current = items[safeIndex];
  const hasPrev = safeIndex > 0;
  const hasNext = safeIndex < items.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onIndexChange(safeIndex - 1);
  }, [hasPrev, onIndexChange, safeIndex]);

  const goNext = useCallback(() => {
    if (hasNext) onIndexChange(safeIndex + 1);
  }, [hasNext, onIndexChange, safeIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, goPrev, goNext]);

  if (!current) return null;

  const v = variant === "detail" ? "detail" : "feed";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "fixed inset-0 left-0 top-0 z-50 flex h-[100dvh] max-h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 flex-col rounded-none border-0 bg-black/92 p-0 shadow-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[min(92vh,52rem)] sm:max-w-[min(96vw,56rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:border-white/10 sm:bg-[#0c0c0c] sm:p-4"
        )}
      >
        <DialogTitle className="sr-only">
          Média {safeIndex + 1} de {items.length}
        </DialogTitle>
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-3 py-2.5 sm:border-0 sm:px-1 sm:pb-3 sm:pt-0">
          <span className="text-xs font-medium tabular-nums text-white/75 sm:text-white/85">
            {safeIndex + 1} / {items.length}
          </span>
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 rounded-full text-white hover:bg-white/10 hover:text-white"
              aria-label="Fechar"
            >
              <X className="size-5" />
            </Button>
          </DialogClose>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4 sm:pb-4">
          {items.length > 1 ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={!hasPrev}
                onClick={goPrev}
                className={cn(
                  "absolute left-1 top-1/2 z-10 size-11 -translate-y-1/2 rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-sm hover:bg-black/55 disabled:pointer-events-none disabled:opacity-25 sm:left-2 sm:size-10"
                )}
                aria-label="Média anterior"
              >
                <ChevronLeft className="size-6 sm:size-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={!hasNext}
                onClick={goNext}
                className={cn(
                  "absolute right-1 top-1/2 z-10 size-11 -translate-y-1/2 rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-sm hover:bg-black/55 disabled:pointer-events-none disabled:opacity-25 sm:right-2 sm:size-10"
                )}
                aria-label="Média seguinte"
              >
                <ChevronRight className="size-6 sm:size-5" />
              </Button>
            </>
          ) : null}

          <div className="flex max-h-[min(calc(100dvh-7rem),82vh)] w-full max-w-full items-center justify-center overflow-hidden sm:max-h-[min(78vh,48rem)]">
            <PostMediaItem key={`${current.storageKey ?? current.url}-${safeIndex}`} item={current} variant={v} displayMode="lightbox" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
