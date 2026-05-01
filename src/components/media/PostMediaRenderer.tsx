import { resolvePublicMediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { PostMediaAttachment } from "@/domain/mediaAttachment";
import { VideoPostPlayer } from "./VideoPostPlayer";

const imgFeed =
  "w-full max-h-[min(22rem,56vw)] rounded-lg object-cover md:max-h-[20rem]";
const imgDetail = "max-h-[460px] w-full object-cover";
const imgMessage = cn(
  "w-full max-w-[min(100%,min(18rem,85vw))] max-h-36 rounded-lg object-cover sm:max-h-40"
);

export type PostMediaRenderVariant = "feed" | "detail" | "message";

export interface PostMediaItemProps {
  item: PostMediaAttachment;
  variant: PostMediaRenderVariant;
  className?: string;
}

/** Um único anexo de publicação (imagem/GIF/sticker ou vídeo). Usado pela grelha e por outros layouts. */
export function PostMediaItem({ item, variant, className }: PostMediaItemProps) {
  if (item.mediaType === "video") {
    return (
      <VideoPostPlayer
        src={item.url}
        poster={item.thumbnailUrl ?? undefined}
        variant={variant}
        className={className}
      />
    );
  }
  const imgClass =
    variant === "detail" ? imgDetail : variant === "message" ? imgMessage : imgFeed;
  return (
    <img
      src={resolvePublicMediaUrl(item.url)}
      alt=""
      className={cn(
        imgClass,
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
