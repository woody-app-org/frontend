import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MediaPreviewItem {
  id: string;
  previewUrl: string;
  kind: "image" | "video";
  /** Miniatura extraída do vídeo (object URL), quando disponível. */
  posterUrl?: string;
}

export interface MediaPreviewGridProps {
  items: MediaPreviewItem[];
  onRemove: (id: string) => void;
  disabled?: boolean;
  className?: string;
  /** <code>composer</code>: carrossel horizontal, remoção mais discreta, vídeo com <code>poster</code> quando existir. */
  variant?: "default" | "composer";
}

export function MediaPreviewGrid({
  items,
  onRemove,
  disabled,
  className,
  variant = "default",
}: MediaPreviewGridProps) {
  if (items.length === 0) return null;

  const isComposer = variant === "composer";
  const images = items.filter((it) => it.kind === "image");
  const videos = items.filter((it) => it.kind === "video");

  const imageCarousel = images.length > 1 && isComposer;

  return (
    <div className={cn(isComposer ? "mt-1.5 space-y-2" : "mt-2 space-y-2", className)}>
      {images.length > 0 ? (
        <div
          className={cn(
            imageCarousel
              ? "flex snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-hidden pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              : cn(
                  "grid gap-1.5 overflow-hidden",
                  images.length === 1 && "grid-cols-1 rounded-xl",
                  images.length === 2 && "grid-cols-2 rounded-xl",
                  images.length >= 3 && "grid-cols-3 rounded-xl"
                )
          )}
          role="list"
          aria-label="Pré-visualização de imagens"
        >
          {images.map((it) => (
            <div
              key={it.id}
              role="listitem"
              className={cn(
                "relative shrink-0 overflow-hidden bg-[var(--woody-nav)]/5",
                imageCarousel && "aspect-[4/3] w-[min(88%,18rem)] snap-center rounded-2xl sm:w-[min(75%,20rem)]",
                !imageCarousel && "aspect-square rounded-lg border border-[var(--woody-accent)]/15"
              )}
            >
              <img
                src={it.previewUrl}
                alt="Pré-visualização"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className={cn(
                  "absolute rounded-full shadow-md",
                  isComposer ? "right-1.5 top-1.5 size-7 border-0 bg-black/45 text-white hover:bg-black/60" : "right-1 top-1 size-7"
                )}
                onClick={() => onRemove(it.id)}
                disabled={disabled}
                aria-label="Remover imagem"
              >
                <X className={isComposer ? "size-3" : "size-3.5"} />
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      {videos.map((it) => (
        <div
          key={it.id}
          className={cn(
            "relative overflow-hidden bg-[var(--woody-nav)]/5",
            isComposer
              ? "rounded-2xl border-0 ring-1 ring-black/[0.06]"
              : "rounded-xl border border-[var(--woody-accent)]/15"
          )}
          role="listitem"
        >
          <video
            src={it.previewUrl}
            poster={it.posterUrl}
            className={cn(
              "w-full object-cover",
              isComposer ? "aspect-video max-h-[min(16rem,72vw)] sm:max-h-60" : "max-h-[min(18rem,70vw)] object-contain sm:max-h-64"
            )}
            controls
            muted
            playsInline
            preload="metadata"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className={cn(
              "absolute rounded-full shadow-md",
              isComposer
                ? "right-2 top-2 size-8 border-0 bg-black/45 text-white hover:bg-black/60"
                : "right-2 top-2 size-9"
            )}
            onClick={() => onRemove(it.id)}
            disabled={disabled}
            aria-label="Remover vídeo"
          >
            <X className={isComposer ? "size-3.5" : "size-4"} />
          </Button>
        </div>
      ))}
    </div>
  );
}
