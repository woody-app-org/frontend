"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { resolvePublicMediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

const frameFeedCls =
  "relative mx-auto aspect-[4/5] w-full max-h-[min(24rem,50dvh)] cursor-pointer overflow-hidden rounded-lg bg-black sm:max-h-[min(26rem,52dvh)]";
const frameDetailCls =
  "relative mx-auto aspect-[4/5] w-full max-h-[min(26rem,52dvh)] overflow-hidden rounded-2xl bg-black sm:max-h-[min(28rem,54dvh)]";

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

  if (variant === "feed" && presentation !== "lightbox" && !playing) {
    return (
      <div
        className={cn(frameFeedCls, className)}
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
            className="pointer-events-none absolute inset-0 size-full object-cover object-center"
            loading="lazy"
            decoding="async"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-black/25" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-black/55 text-white ring-2 ring-white/20 backdrop-blur-sm transition-transform hover:scale-105 hover:bg-black/70">
            <Play className="size-7 ml-1" fill="currentColor" strokeWidth={0} />
          </span>
        </div>
      </div>
    );
  }

  if (presentation === "lightbox") {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video
        src={resolvedSrc}
        poster={resolvedPoster}
        className={cn(lightboxVideo, className)}
        controls
        controlsList="nodownload"
        playsInline
        preload={preloadForVariant(variant, presentation)}
        aria-label={label}
      />
    );
  }

  if (variant === "message") {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video
        src={resolvedSrc}
        poster={resolvedPoster}
        className={cn(messageVideo, className)}
        controls
        controlsList="nodownload"
        playsInline
        autoPlay={playing}
        preload={preloadForVariant(variant, presentation)}
        aria-label={label}
      />
    );
  }

  const framedShell = variant === "detail" ? frameDetailCls : frameFeedCls;

  return (
    <div className={cn(framedShell, className)}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        src={resolvedSrc}
        poster={resolvedPoster}
        className="absolute inset-0 size-full object-cover object-center bg-black"
        controls
        controlsList="nodownload"
        playsInline
        autoPlay={playing}
        preload={preloadForVariant(variant, presentation)}
        aria-label={label}
      />
    </div>
  );
}
