import { resolvePublicMediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { PostMediaAttachment } from "@/domain/mediaAttachment";
import { VideoPostPlayer } from "./VideoPostPlayer";

export type PostMediaRenderVariant = "feed" | "detail" | "message";

/** `hero` = destaque no post; `grid` = miniatura na grelha; `lightbox` = visualização ampliada. */
export type PostMediaDisplayMode = "hero" | "grid" | "lightbox";

export interface PostMediaItemProps {
  item: PostMediaAttachment;
  variant: PostMediaRenderVariant;
  displayMode?: PostMediaDisplayMode;
  className?: string;
}

const heroImgFeed =
  "mx-auto h-auto w-full max-w-full object-contain max-h-[min(26rem,68vh)] min-h-[140px] md:max-h-[min(30rem,72vh)]";
const heroImgDetail =
  "mx-auto h-auto w-full max-w-full object-contain max-h-[min(36rem,82vh)] min-h-[160px] md:max-h-[min(42rem,85vh)]";
const heroImgMessage = cn(
  "mx-auto h-auto w-full max-w-[min(100%,min(18rem,85vw))] max-h-36 object-contain sm:max-h-40"
);

const gridMedia = "absolute inset-0 h-full w-full object-cover";
const lightboxImg =
  "mx-auto block h-auto max-h-[min(82vh,52rem)] w-auto max-w-[min(96vw,56rem)] object-contain";

function GridVideoThumb({
  src,
  poster,
  className,
}: {
  src: string;
  poster?: string;
  className?: string;
}) {
  const resolvedSrc = resolvePublicMediaUrl(src);
  const resolvedPoster = poster ? resolvePublicMediaUrl(poster) : undefined;
  return (
    <video
      src={resolvedSrc}
      poster={resolvedPoster}
      className={cn(gridMedia, className)}
      muted
      playsInline
      preload="metadata"
      aria-hidden
      tabIndex={-1}
    />
  );
}

/** Um único anexo de publicação (imagem/GIF/sticker ou vídeo). */
export function PostMediaItem({ item, variant, displayMode = "hero", className }: PostMediaItemProps) {
  const mode = displayMode;

  if (item.mediaType === "video") {
    if (mode === "grid") {
      return <GridVideoThumb src={item.url} poster={item.thumbnailUrl ?? undefined} className={className} />;
    }
    if (mode === "lightbox") {
      return (
        <VideoPostPlayer
          src={item.url}
          poster={item.thumbnailUrl ?? undefined}
          variant={variant === "message" ? "message" : "detail"}
          presentation="lightbox"
          className={cn("mx-auto max-h-[min(82vh,52rem)] w-full max-w-[min(96vw,56rem)]", className)}
        />
      );
    }
    return (
      <VideoPostPlayer
        src={item.url}
        poster={item.thumbnailUrl ?? undefined}
        variant={variant}
        className={className}
      />
    );
  }

  const imgHeroClass =
    variant === "detail" ? heroImgDetail : variant === "message" ? heroImgMessage : heroImgFeed;

  if (mode === "grid") {
    return (
      <img
        src={resolvePublicMediaUrl(item.url)}
        alt=""
        className={cn(
          gridMedia,
          item.mediaType === "sticker" && "object-contain p-1.5",
          className
        )}
        loading="lazy"
        decoding="async"
      />
    );
  }

  if (mode === "lightbox") {
    return (
      <img
        src={resolvePublicMediaUrl(item.url)}
        alt=""
        className={cn(lightboxImg, item.mediaType === "sticker" && "object-contain p-4", className)}
        loading="eager"
        decoding="async"
      />
    );
  }

  return (
    <img
      src={resolvePublicMediaUrl(item.url)}
      alt=""
      className={cn(
        imgHeroClass,
        item.mediaType === "sticker"
          ? variant === "message"
            ? "max-h-28 bg-transparent object-contain"
            : "max-h-48 bg-transparent object-contain"
          : undefined,
        className
      )}
      loading="lazy"
      decoding="async"
    />
  );
}
