import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostMediaAttachment } from "@/domain/mediaAttachment";
import { PostMediaItem, type PostMediaRenderVariant } from "./PostMediaRenderer";

export type PostMediaGridDensity = Extract<PostMediaRenderVariant, "feed" | "detail">;

const cellInteractive =
  "group relative flex min-h-0 min-w-0 cursor-zoom-in overflow-hidden rounded-[0.65rem] bg-black/5 ring-1 ring-black/[0.07] outline-none transition-[box-shadow,transform] hover:ring-black/12 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--woody-card)] [&:has(video)]:bg-black/90";

/** Altura do bloco multi-média: feed mais generoso, detalhe mais alto. */
function galleryShellHeight(variant: PostMediaGridDensity): string {
  return variant === "detail"
    ? "h-[min(36rem,74vh)] sm:h-[min(40rem,78vh)]"
    : "h-[min(26rem,62vw)] sm:h-[min(30rem,52vw)]";
}

export interface PostMediaGridLayoutProps {
  items: PostMediaAttachment[];
  variant: PostMediaGridDensity;
  onCellActivate: (index: number) => void;
  className?: string;
}

function MediaThumb({
  item,
  variant,
}: {
  item: PostMediaAttachment;
  variant: PostMediaGridDensity;
}) {
  return (
    <>
      <PostMediaItem item={item} variant={variant} displayMode="grid" />
      {item.mediaType === "video" ? (
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-black/55 text-white ring-1 ring-white/20 backdrop-blur-sm">
            <Play className="size-4 ml-0.5" fill="currentColor" strokeWidth={0} />
          </span>
        </span>
      ) : null}
    </>
  );
}

export function PostMediaGridLayout({ items, variant, onCellActivate, className }: PostMediaGridLayoutProps) {
  const n = items.length;
  if (n < 2) return null;

  const shell = cn("w-full", galleryShellHeight(variant), className);

  if (n === 2) {
    return (
      <div className={cn("grid h-full w-full grid-cols-2 gap-1.5", shell)} role="list" aria-label="Galeria de mídia">
        {[0, 1].map((i) => (
          <button
            key={`${items[i].storageKey ?? items[i].url}-${i}`}
            type="button"
            className={cn(cellInteractive, "h-full w-full")}
            aria-label={`Abrir mídia ${i + 1} de ${n}`}
            onClick={() => onCellActivate(i)}
          >
            <MediaThumb item={items[i]} variant={variant} />
          </button>
        ))}
      </div>
    );
  }

  if (n === 3) {
    return (
      <div
        className={cn("grid h-full w-full grid-cols-2 grid-rows-2 gap-1.5", shell)}
        style={{ gridTemplateColumns: "1.22fr 0.78fr" }}
        role="list"
        aria-label="Galeria de mídia"
      >
        <button
          type="button"
          className={cn(cellInteractive, "row-span-2 h-full min-h-0")}
          aria-label="Abrir mídia 1 de 3"
          onClick={() => onCellActivate(0)}
        >
          <MediaThumb item={items[0]} variant={variant} />
        </button>
        <button
          type="button"
          className={cn(cellInteractive, "min-h-0")}
          aria-label="Abrir mídia 2 de 3"
          onClick={() => onCellActivate(1)}
        >
          <MediaThumb item={items[1]} variant={variant} />
        </button>
        <button
          type="button"
          className={cn(cellInteractive, "min-h-0")}
          aria-label="Abrir mídia 3 de 3"
          onClick={() => onCellActivate(2)}
        >
          <MediaThumb item={items[2]} variant={variant} />
        </button>
      </div>
    );
  }

  const showOverlay = n > 4;
  const moreCount = n - 4;

  return (
    <div className={cn("grid h-full w-full grid-cols-2 grid-rows-2 gap-1.5", shell)} role="list" aria-label="Galeria de mídia">
      {[0, 1, 2, 3].map((i) => {
        const item = items[i];
        const isFourthWithMore = i === 3 && showOverlay;
        return (
          <button
            key={`${item.storageKey ?? item.url}-${i}`}
            type="button"
            className={cn(cellInteractive, "min-h-0")}
            aria-label={
              isFourthWithMore ? `Abrir galeria — mais ${moreCount} médias` : `Abrir mídia ${i + 1} de ${n}`
            }
            onClick={() => onCellActivate(i)}
          >
            <MediaThumb item={item} variant={variant} />
            {isFourthWithMore ? (
              <span
                className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/45 text-lg font-semibold tabular-nums text-white backdrop-blur-[1px] sm:text-xl"
                aria-hidden
              >
                +{moreCount}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
