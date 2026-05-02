import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MediaPreviewItem {
  id: string;
  previewUrl: string;
  kind: "image" | "video";
}

export interface MediaPreviewGridProps {
  items: MediaPreviewItem[];
  onRemove: (id: string) => void;
  disabled?: boolean;
  className?: string;
}

export function MediaPreviewGrid({ items, onRemove, disabled, className }: MediaPreviewGridProps) {
  if (items.length === 0) return null;

  const images = items.filter((it) => it.kind === "image");
  const videos = items.filter((it) => it.kind === "video");

  return (
    <div className={cn("mt-2 space-y-2", className)}>
      {/* Grade de imagens: 1 → full-width; 2-3 → colunas iguais */}
      {images.length > 0 ? (
        <div
          className={cn(
            "grid gap-1.5 overflow-hidden rounded-xl",
            images.length === 1 && "grid-cols-1",
            images.length === 2 && "grid-cols-2",
            images.length >= 3 && "grid-cols-3"
          )}
          role="list"
          aria-label="Pré-visualização de imagens"
        >
          {images.map((it) => (
            <div
              key={it.id}
              role="listitem"
              className="relative aspect-square overflow-hidden rounded-lg border border-[var(--woody-accent)]/15 bg-[var(--woody-nav)]/5"
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
                className="absolute right-1 top-1 size-7 rounded-full shadow-md"
                onClick={() => onRemove(it.id)}
                disabled={disabled}
                aria-label="Remover imagem"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      {/* Vídeo: sempre em linha separada */}
      {videos.map((it) => (
        <div
          key={it.id}
          className="relative overflow-hidden rounded-xl border border-[var(--woody-accent)]/15 bg-[var(--woody-nav)]/5"
          role="listitem"
        >
          <video
            src={it.previewUrl}
            className="max-h-[min(18rem,70vw)] w-full object-contain sm:max-h-64"
            controls
            muted
            playsInline
            preload="metadata"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute right-2 top-2 size-9 rounded-full shadow-md"
            onClick={() => onRemove(it.id)}
            disabled={disabled}
            aria-label="Remover vídeo"
          >
            <X className="size-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
