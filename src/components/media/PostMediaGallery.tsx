"use client";

import { useCallback, useState } from "react";
import { Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostMediaAttachment } from "@/domain/mediaAttachment";
import { PostMediaCarousel } from "./PostMediaCarousel";
import { PostMediaItem, type PostMediaRenderVariant } from "./PostMediaRenderer";
import { PostMediaLightbox } from "./PostMediaLightbox";

const mediaBlock = "mt-5 w-full overflow-visible sm:mt-6";

const heroTap =
  "block w-full cursor-zoom-in rounded-2xl sm:rounded-[1.25rem] outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--woody-card)]";

export interface PostMediaGalleryProps {
  items: PostMediaAttachment[];
  className?: string;
  /** `detail` = pré-visualização maior na página do post. */
  variant?: PostMediaRenderVariant;
}

function singleItemTapExpandable(mediaType: PostMediaAttachment["mediaType"]): boolean {
  return mediaType === "image" || mediaType === "gif" || mediaType === "sticker";
}

export function PostMediaGallery({ items, className, variant = "feed" }: PostMediaGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const v: "feed" | "detail" = variant === "detail" ? "detail" : "feed";

  const openAt = useCallback((index: number) => {
    setSlideIndex(index);
    setLightboxOpen(true);
  }, []);

  if (items.length === 0) return null;

  const lightbox = (
    <PostMediaLightbox
      open={lightboxOpen}
      onOpenChange={setLightboxOpen}
      items={items}
      index={slideIndex}
      onIndexChange={setSlideIndex}
      variant={v}
    />
  );

  if (items.length === 1) {
    const m = items[0];
    const tapWhole = singleItemTapExpandable(m.mediaType);

    return (
      <>
        <div className={cn(mediaBlock, className)}>
          {tapWhole ? (
            <button type="button" className={heroTap} aria-label="Ampliar mídia" onClick={() => openAt(0)}>
              <PostMediaItem item={m} variant={variant} displayMode="hero" />
            </button>
          ) : (
            <div className="relative">
              <PostMediaItem item={m} variant={variant} displayMode="hero" />
              <button
                type="button"
                className="absolute bottom-2 right-2 z-10 flex size-10 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white shadow-md backdrop-blur-sm transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/50"
                aria-label="Ver vídeo ampliado"
                onClick={() => openAt(0)}
              >
                <Maximize2 className="size-4" strokeWidth={2} />
              </button>
            </div>
          )}
        </div>
        {lightbox}
      </>
    );
  }

  return (
    <>
      <div className={cn(mediaBlock, className)}>
        <PostMediaCarousel
          items={items}
          variant={v}
          activeIndex={slideIndex}
          onActiveIndexChange={setSlideIndex}
          onExpandAt={openAt}
        />
      </div>
      {lightbox}
    </>
  );
}
