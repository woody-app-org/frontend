import { cn } from "@/lib/utils";
import type { PostMediaAttachment } from "@/domain/mediaAttachment";

const wrap = "mt-4 w-full overflow-hidden rounded-lg bg-black/[0.025] ring-1 ring-black/[0.05]";
const imgClass = "w-full object-cover max-h-[min(22rem,56vw)] rounded-lg md:max-h-[20rem]";
const videoClass = "w-full max-h-[min(22rem,56vw)] rounded-lg md:max-h-[24rem] bg-black";

export interface PostMediaGalleryProps {
  items: PostMediaAttachment[];
  className?: string;
}

export function PostMediaGallery({ items, className }: PostMediaGalleryProps) {
  if (items.length === 0) return null;

  if (items.length === 1) {
    const m = items[0];
    return <div className={cn(wrap, className)}>{renderOne(m)}</div>;
  }

  return (
    <div
      className={cn("mt-4 flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory", className)}
      role="list"
      aria-label="Média da publicação"
    >
      {items.map((m, idx) => (
        <div
          key={`${m.url}-${idx}`}
          role="listitem"
          className={cn(wrap, "min-w-[min(100%,280px)] shrink-0 snap-center max-w-[85vw]")}
        >
          {renderOne(m)}
        </div>
      ))}
    </div>
  );
}

function renderOne(m: PostMediaAttachment) {
  if (m.mediaType === "video") {
    return (
      <video
        src={m.url}
        className={videoClass}
        controls
        playsInline
        preload="metadata"
        aria-label="Vídeo da publicação"
      />
    );
  }
  return (
    <img
      src={m.url}
      alt=""
      className={cn(imgClass, m.mediaType === "sticker" ? "max-h-48 object-contain bg-transparent" : undefined)}
      loading="lazy"
      decoding="async"
    />
  );
}
