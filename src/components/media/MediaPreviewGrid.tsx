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
  return (
    <ul
      className={cn("mt-2 list-none space-y-2 p-0", className)}
      role="list"
      aria-label="Pré-visualização de mídia"
    >
      {items.map((it) => (
        <li
          key={it.id}
          className="relative overflow-hidden rounded-xl border border-[var(--woody-accent)]/15 bg-[var(--woody-nav)]/5"
        >
          {it.kind === "video" ? (
            <video
              src={it.previewUrl}
              className="max-h-[min(18rem,70vw)] w-full object-contain sm:max-h-64"
              controls
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={it.previewUrl}
              alt="Pré-visualização"
              className="max-h-[min(18rem,70vw)] w-full object-contain sm:max-h-64"
              loading="lazy"
              decoding="async"
            />
          )}
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute right-2 top-2 size-9 rounded-full shadow-md"
            onClick={() => onRemove(it.id)}
            disabled={disabled}
            aria-label="Remover mídia"
          >
            <X className="size-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
