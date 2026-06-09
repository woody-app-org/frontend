import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Loader2, Pause } from "lucide-react";
import { resolvePublicMediaUrl } from "@/lib/api";
import type { Story } from "../types";
import { resolveStoryTextBackground } from "../lib/storyUtils";

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

    if (story.mediaType === "text") {
      const bg = resolveStoryTextBackground(story.backgroundColor);
      return (
        <div
          className="flex h-full w-full items-center justify-center px-6 py-16 sm:px-10"
          style={{ backgroundColor: bg }}
        >
          <p className="max-w-lg whitespace-pre-wrap break-words text-center text-2xl font-semibold leading-snug text-white drop-shadow-sm sm:text-3xl">
            {story.text ?? ""}
          </p>
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
            playsInline
            muted={videoMuted}
            preload="auto"
            onEnded={() => onVideoEnded?.()}
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (!v.duration || !Number.isFinite(v.duration)) return;
              onVideoTimeUpdate?.(Math.min(1, v.currentTime / v.duration));
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
        </div>
      );
    }

    if (imageUrl) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-black px-1">
          <img
            src={imageUrl}
            alt=""
            className="max-h-full max-w-full object-contain"
            draggable={false}
            decoding="async"
          />
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
