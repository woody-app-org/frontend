import { cn } from "@/lib/utils";
import type { PostMediaAttachment } from "@/domain/mediaAttachment";
import { PostMediaItem, type PostMediaRenderVariant } from "./PostMediaRenderer";

const wrap =
  "mt-4 w-full overflow-hidden rounded-lg bg-black/[0.025] ring-1 ring-black/[0.05] [&:has(video)]:bg-black/90";

export interface PostMediaGalleryProps {
  items: PostMediaAttachment[];
  className?: string;
  /** `detail` aumenta o vídeo na página do post. */
  variant?: PostMediaRenderVariant;
}

export function PostMediaGallery({ items, className, variant = "feed" }: PostMediaGalleryProps) {
  if (items.length === 0) return null;

  if (items.length === 1) {
    const m = items[0];
    return (
      <div className={cn(wrap, className)}>
        <PostMediaItem item={m} variant={variant} />
      </div>
    );
  }

  return (
    <div
      className={cn("mt-4 flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] snap-x snap-mandatory", className)}
      role="list"
      aria-label="Média da publicação"
    >
      {items.map((m, idx) => (
        <div
          key={`${m.storageKey ?? m.url}-${idx}`}
          role="listitem"
          className={cn(
            wrap,
            "min-w-[min(100%,280px)] max-w-[85vw] shrink-0 snap-center [&:has(video)]:min-h-[min(12rem,40vw)]"
          )}
        >
          <PostMediaItem item={m} variant={variant} />
        </div>
      ))}
    </div>
  );
}
