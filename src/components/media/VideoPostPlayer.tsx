import { resolvePublicMediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

const feed =
  "min-h-[120px] w-full max-h-[min(22rem,72vw)] rounded-lg bg-black object-contain md:max-h-[24rem]";
const detail =
  "min-h-[140px] w-full max-h-[min(32rem,85vw)] rounded-2xl bg-black object-contain md:max-h-[32rem]";
const message =
  "min-h-[88px] w-full max-w-[min(100%,min(18rem,85vw))] max-h-36 rounded-lg bg-black object-contain touch-manipulation sm:max-h-40";
const lightbox =
  "max-h-[min(82vh,52rem)] w-full max-w-[min(96vw,56rem)] rounded-xl bg-black object-contain";

export type VideoPostPlayerVariant = "feed" | "detail" | "message";

export interface VideoPostPlayerProps {
  src: string;
  poster?: string;
  variant: VideoPostPlayerVariant;
  className?: string;
  /** `lightbox` = área ampliada no modal. */
  presentation?: "default" | "lightbox";
  ariaLabel?: string;
}

function preloadForVariant(variant: VideoPostPlayerVariant, presentation: string): "none" | "metadata" {
  if (presentation === "lightbox") return "metadata";
  return variant === "feed" ? "none" : "metadata";
}

export function VideoPostPlayer({
  src,
  poster,
  variant,
  className,
  presentation = "default",
  ariaLabel,
}: VideoPostPlayerProps) {
  const label =
    ariaLabel ?? (variant === "message" ? "Vídeo anexado à mensagem" : "Vídeo da publicação");
  const sizeClass =
    presentation === "lightbox"
      ? lightbox
      : variant === "detail"
        ? detail
        : variant === "message"
          ? message
          : feed;
  const resolvedSrc = resolvePublicMediaUrl(src);
  const resolvedPoster = poster ? resolvePublicMediaUrl(poster) : undefined;
  return (
    <video
      src={resolvedSrc}
      poster={resolvedPoster}
      className={cn(sizeClass, className)}
      controls
      controlsList="nodownload"
      playsInline
      preload={preloadForVariant(variant, presentation)}
      aria-label={label}
    />
  );
}
