import { cn } from "@/lib/utils";
import type { PostMediaAttachment } from "@/domain/mediaAttachment";
import { VideoPostPlayer } from "./VideoPostPlayer";

const imgFeed =
  "w-full max-h-[min(22rem,56vw)] rounded-lg object-cover md:max-h-[20rem]";
const imgDetail = "max-h-[460px] w-full object-cover";

export type PostMediaRenderVariant = "feed" | "detail";

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
  return (
    <img
      src={item.url}
      alt=""
      className={cn(
        variant === "detail" ? imgDetail : imgFeed,
        item.mediaType === "sticker" ? "max-h-48 bg-transparent object-contain" : undefined,
        className
      )}
      loading="lazy"
      decoding="async"
    />
  );
}
