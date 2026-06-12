import { forwardRef, useEffect, useImperativeHandle, useRef, type RefCallback } from "react";
import { Link } from "react-router-dom";
import { Loader2, Pause } from "lucide-react";
import { profilePath } from "@/features/profile/lib/profilePaths";
import { resolvePublicMediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import { SharedPostPreviewCard } from "@/features/messages/components/SharedPostPreviewCard";
import type { Story, StoryLayer } from "../types";
import { resolveStoryTextBackground } from "../lib/storyUtils";

const LAYER_FONT_SIZE_CLASS: Record<NonNullable<StoryLayer["fontSize"]>, string> = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-3xl",
};

function StoryLayerRenderer({
  layer,
  videoMuted,
  isActive,
}: {
  layer: StoryLayer;
  videoMuted: boolean;
  isActive: boolean;
}) {
  const style = {
    left: `${(layer.x - layer.width / 2) * 100}%`,
    top: `${(layer.y - layer.height / 2) * 100}%`,
    width: `${layer.width * 100}%`,
    height: `${layer.height * 100}%`,
    transform: `rotate(${layer.rotation}deg)`,
  };

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || layer.type !== "video") return;
    if (!isActive) {
      v.pause();
      return;
    }
    v.currentTime = 0;
    void v.play().catch(() => undefined);
  }, [isActive, layer.type]);

  if (layer.type === "text") {
    return (
      <div
        className={cn(
          "pointer-events-none absolute flex items-center justify-center whitespace-pre-wrap break-words text-center font-semibold leading-snug drop-shadow-sm",
          LAYER_FONT_SIZE_CLASS[layer.fontSize ?? "md"]
        )}
        style={{ ...style, color: layer.color ?? "#ffffff" }}
      >
        {layer.text}
      </div>
    );
  }

  if (layer.type === "mention") {
    const username = (layer.text ?? "").replace(/^@/, "");
    return (
      <div className="absolute flex items-center justify-center" style={style}>
        <Link
          to={username ? profilePath(username) : "#"}
          className={cn(
            "pointer-events-auto z-30 inline-flex max-w-full items-center truncate rounded-full",
            "bg-white/15 px-3.5 py-1.5 text-sm font-semibold uppercase tracking-wide text-white",
            "shadow-[0_2px_10px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-colors hover:bg-white/25"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          @{username}
        </Link>
      </div>
    );
  }

  if (layer.type === "image") {
    return (
      <img
        src={layer.mediaUrl ? resolvePublicMediaUrl(layer.mediaUrl) : undefined}
        alt=""
        className="pointer-events-none absolute object-contain"
        style={style}
        draggable={false}
      />
    );
  }

  const setVideoRef: RefCallback<HTMLVideoElement> = (el) => {
    if (el) el.muted = videoMuted;
  };

  return (
    <video
      ref={(el) => {
        videoRef.current = el;
        setVideoRef(el);
      }}
      src={layer.mediaUrl ? resolvePublicMediaUrl(layer.mediaUrl) : undefined}
      className="pointer-events-none absolute object-contain"
      style={style}
      muted={videoMuted}
      loop
      autoPlay={isActive}
      playsInline
    />
  );
}

export interface StoryViewerSlideHandle {
  play: () => void;
  pause: () => void;
  getVideoElement: () => HTMLVideoElement | null;
}

export interface StoryViewerSlideProps {
  story: Story;
  isActive: boolean;
  paused: boolean;
  /** Vídeo deve tocar mutado (há música própria do story tocando em paralelo, ou o som nativo está desligado). */
  videoMuted?: boolean;
  onVideoEnded?: () => void;
  onVideoTimeUpdate?: (progress: number) => void;
  onVideoLoadedMetadata?: () => void;
}

export const StoryViewerSlide = forwardRef<StoryViewerSlideHandle, StoryViewerSlideProps>(
  function StoryViewerSlide(
    { story, isActive, paused, videoMuted = true, onVideoEnded, onVideoTimeUpdate, onVideoLoadedMetadata },
    ref
  ) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const imageUrl = story.mediaUrl ? resolvePublicMediaUrl(story.mediaUrl) : "";
    const posterUrl = story.thumbnailUrl ? resolvePublicMediaUrl(story.thumbnailUrl) : undefined;

    useImperativeHandle(ref, () => ({
      play: () => {
        const v = videoRef.current;
        if (!v) return;
        void v.play().catch(() => undefined);
      },
      pause: () => {
        videoRef.current?.pause();
      },
      getVideoElement: () => videoRef.current,
    }));

    // Reinicia do zero apenas quando o slide passa a ser o ativo (story novo) — nunca
    // quando só se alterna pausa/retomada (ex.: focar/desfocar o campo de resposta),
    // senão o vídeo "nunca avança" e a resposta ao story parece demorar uma eternidade.
    useEffect(() => {
      if (!isActive || story.mediaType !== "video") return;
      const v = videoRef.current;
      if (!v) return;
      v.currentTime = 0;
      if (!paused) void v.play().catch(() => undefined);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, story.id, story.mediaType]);

    useEffect(() => {
      if (!isActive || story.mediaType !== "video") return;
      const v = videoRef.current;
      if (!v) return;
      if (paused) {
        v.pause();
      } else {
        void v.play().catch(() => undefined);
      }
    }, [isActive, paused, story.mediaType]);

    // O atributo JSX `muted` só define o estado inicial (`defaultMuted`) — o React não
    // sincroniza a propriedade viva do elemento depois da montagem. Sem isto, tocar no
    // botão de som não tem efeito nenhum sobre o áudio do vídeo.
    useEffect(() => {
      const v = videoRef.current;
      if (v) v.muted = videoMuted;
    }, [videoMuted, story.id]);

    const layers = story.layers ?? [];
    const layersNode = layers.length > 0 ? (
      <>
        {layers.map((layer, i) => (
          <StoryLayerRenderer key={i} layer={layer} videoMuted={videoMuted} isActive={isActive} />
        ))}
      </>
    ) : null;

    const overlay = layers.length === 0 && story.overlayText ? (
      <p
        className="pointer-events-none absolute max-w-[85%] -translate-x-1/2 -translate-y-1/2 whitespace-pre-wrap break-words text-center text-xl font-semibold leading-snug drop-shadow-sm"
        style={{
          left: `${(story.overlayTextX ?? 0.5) * 100}%`,
          top: `${(story.overlayTextY ?? 0.5) * 100}%`,
          color: story.overlayTextColor ?? "#ffffff",
        }}
      >
        {story.overlayText}
      </p>
    ) : null;

    const scale = story.contentScale ?? 1;

    if (story.mediaType === "shared_post") {
      return (
        <div
          className="relative flex h-full w-full flex-col items-center justify-center gap-3 px-6"
          style={{ backgroundColor: story.backgroundColor || "#000000" }}
        >

          <SharedPostPreviewCard
            preview={story.sharedPost ?? { isUnavailable: true }}
            className="w-full max-w-sm"
            style={{ transform: `scale(${scale})` }}
          />
          {overlay}
          {layersNode}
        </div>
      );
    }

    if (story.mediaType === "text") {
      const bg = resolveStoryTextBackground(story.backgroundColor);
      return (
        <div
          className="relative flex h-full w-full items-center justify-center px-6 py-16 sm:px-10"
          style={{ backgroundColor: bg }}
        >
          <p className="max-w-lg whitespace-pre-wrap break-words text-center text-2xl font-semibold leading-snug text-white drop-shadow-sm sm:text-3xl">
            {story.text ?? ""}
          </p>
          {overlay}
          {layersNode}
        </div>
      );
    }

    if (story.mediaType === "video" && imageUrl) {
      return (
        <div className="relative flex h-full w-full items-center justify-center bg-black">
          <video
            ref={videoRef}
            key={story.id}
            src={imageUrl}
            poster={posterUrl}
            className="max-h-full max-w-full object-contain"
            style={{ transform: `scale(${scale})` }}
            playsInline
            muted={videoMuted}
            preload="auto"
            onEnded={() => onVideoEnded?.()}
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (!v.duration || !Number.isFinite(v.duration)) return;
              const cap = Math.min(v.duration, 30);
              if (v.currentTime >= cap) {
                onVideoTimeUpdate?.(1);
                onVideoEnded?.();
                return;
              }
              onVideoTimeUpdate?.(Math.min(1, v.currentTime / cap));
            }}
            onLoadedMetadata={() => onVideoLoadedMetadata?.()}
          />
          {paused && isActive ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
              <span className="flex size-14 items-center justify-center rounded-full bg-black/45 text-white">
                <Pause className="size-7" aria-hidden />
              </span>
            </div>
          ) : null}
          {overlay}
          {layersNode}
        </div>
      );
    }

    if (imageUrl) {
      return (
        <div className="relative flex h-full w-full items-center justify-center bg-black px-1">
          <img
            src={imageUrl}
            alt=""
            className="max-h-full max-w-full object-contain"
            style={{ transform: `scale(${scale})` }}
            draggable={false}
            decoding="async"
          />
          {overlay}
          {layersNode}
        </div>
      );
    }

    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white/70">
        <Loader2 className="size-8 animate-spin" aria-hidden />
      </div>
    );
  }
);
