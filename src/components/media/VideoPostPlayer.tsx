"use client";

import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { resolvePublicMediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import { classifyPostMediaIntrinsic, type PostMediaIntrinsicKind } from "./postMediaIntrinsicKind";
import { adaptiveMediaShellClass, adaptiveVideoClass } from "./postAdaptivePresentation";

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
  /** Slides dentro do carrossel: ocupa só o viewport sem moldura própria */
  carouselFillParent?: boolean;
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
  carouselFillParent = false,
  ariaLabel,
}: VideoPostPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [kind, setKind] = useState<PostMediaIntrinsicKind | null>(null);

  const label =
    ariaLabel ?? (variant === "message" ? "Vídeo anexado à mensagem" : "Vídeo da publicação");
  const resolvedSrc = resolvePublicMediaUrl(src);
  const resolvedPoster = poster ? resolvePublicMediaUrl(poster) : undefined;
  const placement: "feed" | "detail" = variant === "detail" ? "detail" : "feed";

  useEffect(() => {
    if (presentation === "lightbox" || variant === "message" || carouselFillParent) return;
    if (resolvedPoster) return;

    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    v.src = resolvedSrc;

    const onMeta = () => {
      setKind(classifyPostMediaIntrinsic(v.videoWidth, v.videoHeight));
      v.src = "";
      v.removeAttribute("src");
      v.load();
    };
    const onErr = () => {
      setKind("landscape");
      v.src = "";
      v.removeAttribute("src");
      v.load();
    };
    v.addEventListener("loadedmetadata", onMeta, { once: true });
    v.addEventListener("error", onErr, { once: true });

    return () => {
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("error", onErr);
      v.src = "";
      v.removeAttribute("src");
      v.load();
    };
  }, [carouselFillParent, presentation, resolvedPoster, resolvedSrc, variant]);

  const onPosterLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setKind(classifyPostMediaIntrinsic(img.naturalWidth, img.naturalHeight));
  };

  const fit = carouselFillParent
    ? "absolute inset-0 size-full object-cover object-center bg-black"
    : adaptiveVideoClass(kind, placement);

  if (carouselFillParent && presentation !== "lightbox" && variant !== "message" && !playing) {
    return (
      <div
        className={cn("relative block size-full cursor-pointer bg-black", className)}
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
            onLoad={onPosterLoad}
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

  if (variant === "feed" && presentation !== "lightbox" && !playing) {
    const shell = adaptiveMediaShellClass(kind, "feed", "video");
    return (
      <div
        className={cn(shell, className)}
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
            onLoad={onPosterLoad}
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

  const framedShell = carouselFillParent
    ? "relative size-full min-h-[200px] overflow-hidden rounded-none bg-black"
    : adaptiveMediaShellClass(kind, placement, "video");

  return (
    <div className={cn(framedShell, className)}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        src={resolvedSrc}
        poster={resolvedPoster}
        className={fit}
        controls
        controlsList="nodownload"
        playsInline
        autoPlay={playing}
        preload={preloadForVariant(variant, presentation)}
        aria-label={label}
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          if (v.videoWidth > 0) {
            setKind(classifyPostMediaIntrinsic(v.videoWidth, v.videoHeight));
          }
        }}
      />
    </div>
  );
}
