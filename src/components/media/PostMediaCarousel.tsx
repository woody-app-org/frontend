"use client";

import { useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostMediaAttachment } from "@/domain/mediaAttachment";
import { Button } from "@/components/ui/button";
import { carouselViewportShellClass } from "./postAdaptivePresentation";
import { PostMediaItem, type PostMediaRenderVariant } from "./PostMediaRenderer";

type Variant = Extract<PostMediaRenderVariant, "feed" | "detail">;

/** Dentro da moldura do carrossel: sem cantos próprios (o viewport já define o raio). */
const heroTapCarousel =
  "block size-full cursor-zoom-in rounded-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/35 focus-visible:ring-inset focus-visible:ring-offset-0 focus-visible:ring-offset-transparent";

const navBtnClass =
  "absolute top-1/2 z-20 size-10 -translate-y-1/2 rounded-full border border-white/25 bg-black/45 text-white shadow-md backdrop-blur-sm hover:bg-black/60 disabled:pointer-events-none disabled:opacity-[0.22] sm:size-11";

function slideExpandable(mediaType: PostMediaAttachment["mediaType"]): boolean {
  return mediaType === "image" || mediaType === "gif" || mediaType === "sticker";
}

export interface PostMediaCarouselProps {
  items: PostMediaAttachment[];
  variant: Variant;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onExpandAt: (index: number) => void;
  className?: string;
}

export function PostMediaCarousel({
  items,
  variant,
  activeIndex,
  onActiveIndexChange,
  onExpandAt,
  className,
}: PostMediaCarouselProps) {
  const n = items.length;
  const safeIdx = Math.min(Math.max(0, activeIndex), Math.max(0, n - 1));
  const touchRef = useRef<{ x: number; y: number } | null>(null);

  const goPrev = useCallback(() => {
    if (safeIdx > 0) onActiveIndexChange(safeIdx - 1);
  }, [safeIdx, onActiveIndexChange]);

  const goNext = useCallback(() => {
    if (safeIdx < n - 1) onActiveIndexChange(safeIdx + 1);
  }, [safeIdx, n, onActiveIndexChange]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.changedTouches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start || n < 2) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    }
  };

  if (n < 2) return null;

  return (
    <div
      className={cn("relative w-full touch-pan-y", className)}
      role="region"
      aria-roledescription="carrossel"
      aria-label={`Mídias da publicação, ${safeIdx + 1} de ${n}`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className={carouselViewportShellClass(variant)}>
        <div className="relative size-full overflow-hidden">
          <div
            className="flex size-full transition-transform duration-300 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${safeIdx * 100}%)` }}
          >
          {items.map((item, i) => {
            const expandable = slideExpandable(item.mediaType);

            return (
              <div
                key={`${item.storageKey ?? item.url}-${i}`}
                className="relative h-full w-full shrink-0 basis-full"
                aria-hidden={i !== safeIdx}
              >
                {expandable ? (
                  <button
                    type="button"
                    className={heroTapCarousel}
                    aria-label={`Ampliar mídia ${i + 1} de ${n}`}
                    onClick={() => onExpandAt(i)}
                  >
                    <PostMediaItem item={item} variant={variant} displayMode="carouselSlide" />
                  </button>
                ) : (
                  <div className="relative size-full">
                    <PostMediaItem item={item} variant={variant} displayMode="carouselSlide" />
                    <button
                      type="button"
                      className="absolute bottom-2 right-2 z-10 flex size-10 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white shadow-md backdrop-blur-sm transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/50"
                      aria-label={`Ver mídia ${i + 1} ampliado`}
                      onClick={() => onExpandAt(i)}
                    >
                      <Maximize2 className="size-4" strokeWidth={2} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={safeIdx <= 0}
        onClick={(e) => {
          e.stopPropagation();
          goPrev();
        }}
        className={cn(navBtnClass, "left-1 sm:left-2")}
        aria-label="Média anterior"
      >
        <ChevronLeft className="size-5 sm:size-6" strokeWidth={2.25} aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={safeIdx >= n - 1}
        onClick={(e) => {
          e.stopPropagation();
          goNext();
        }}
        className={cn(navBtnClass, "right-1 sm:right-2")}
        aria-label="Próxima mídia"
      >
        <ChevronRight className="size-5 sm:size-6" strokeWidth={2.25} aria-hidden />
      </Button>

      <div
        className="pointer-events-none absolute bottom-2.5 left-0 right-0 flex justify-center gap-1 px-12"
        aria-hidden
      >
        {items.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 rounded-full shadow-sm ring-1 ring-black/20 transition-[width,background]",
              i === safeIdx ? "w-6 bg-white" : "w-1.5 bg-white/45"
            )}
          />
        ))}
      </div>
    </div>
  );
}
