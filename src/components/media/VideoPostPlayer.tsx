"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { resolvePublicMediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

const feedSize =
  "min-h-[120px] w-full max-h-[min(22rem,72vw)] rounded-lg md:max-h-[24rem]";
const detailVideo =
  "min-h-[140px] w-full max-h-[min(32rem,85vw)] rounded-2xl bg-black object-contain md:max-h-[32rem]";
const messageVideo =
  "min-h-[88px] w-full max-w-[min(100%,min(18rem,85vw))] max-h-36 rounded-lg bg-black object-contain touch-manipulation sm:max-h-40";
const lightboxVideo =
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
  const [playing, setPlaying] = useState(false);

  const label =
    ariaLabel ?? (variant === "message" ? "Vídeo anexado à mensagem" : "Vídeo da publicação");
  const resolvedSrc = resolvePublicMediaUrl(src);
  const resolvedPoster = poster ? resolvePublicMediaUrl(poster) : undefined;

  // Feed mode antes de clicar: poster visual + botão play customizado
  if (variant === "feed" && presentation !== "lightbox" && !playing) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-lg bg-black cursor-pointer",
          feedSize,
          className
        )}
        role="button"
        tabIndex={0}
        aria-label={`Reproduzir: ${label}`}
        onClick={() => setPlaying(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setPlaying(true);
          }
        }}
      >
        {resolvedPoster ? (
          <img
            src={resolvedPoster}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : null}
        {/* overlay escuro leve para destacar o botão play */}
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-black/55 text-white ring-2 ring-white/20 backdrop-blur-sm transition-transform hover:scale-105 hover:bg-black/70">
            <Play className="size-7 ml-1" fill="currentColor" strokeWidth={0} />
          </span>
        </div>
      </div>
    );
  }

  // Detail / message / lightbox / playing: player nativo
  const sizeClass =
    presentation === "lightbox"
      ? lightboxVideo
      : variant === "detail"
        ? detailVideo
        : variant === "message"
          ? messageVideo
          : cn(feedSize, "bg-black object-contain");

  return (
    <video
      src={resolvedSrc}
      poster={resolvedPoster}
      className={cn(sizeClass, className)}
      controls
      controlsList="nodownload"
      playsInline
      // eslint-disable-next-line jsx-a11y/media-has-caption
      autoPlay={playing}
      preload={preloadForVariant(variant, presentation)}
      aria-label={label}
    />
  );
}
