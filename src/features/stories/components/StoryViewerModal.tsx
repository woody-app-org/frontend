import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { StoryRing } from "@/components/ui/StoryRing";
import { formatRelativeTimeUtc } from "@/lib/formatRelativeTimeUtc";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { usePrefersReducedMotion } from "@/features/landing/motion/usePrefersReducedMotion";
import type { Story } from "../types";
import {
  filterActiveStories,
  isStoryNotExpired,
  STORY_STATIC_DURATION_MS,
} from "../lib/storyUtils";
import { fetchUserStories, markStoryViewed } from "../services/stories.service";
import { StoryViewerSlide, type StoryViewerSlideHandle } from "./StoryViewerSlide";

export interface StoryViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  initialStoryIndex?: number;
  onStoriesConsumed?: () => void;
}

export function StoryViewerModal({
  open,
  onOpenChange,
  userId,
  initialStoryIndex = 0,
  onStoriesConsumed,
}: StoryViewerModalProps) {
  const reduceMotion = usePrefersReducedMotion();
  const [stories, setStories] = useState<Story[]>([]);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [segmentProgress, setSegmentProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [holding, setHolding] = useState(false);

  const slideRef = useRef<StoryViewerSlideHandle>(null);
  const storiesRef = useRef<Story[]>([]);
  const markedViewRef = useRef<Set<string>>(new Set());
  const staticTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const staticStartedRef = useRef(0);

  const currentStory = stories[currentIndex] ?? null;
  const isPaused = paused || holding;
  const hasPrev = currentIndex > 0;

  useEffect(() => {
    storiesRef.current = stories;
  }, [stories]);

  const closeViewer = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const goPrev = useCallback(() => {
    setSegmentProgress(0);
    setCurrentIndex((idx) => Math.max(0, idx - 1));
  }, []);

  const advanceStory = useCallback(() => {
    const active = filterActiveStories(storiesRef.current);
    if (active.length !== storiesRef.current.length) {
      setStories(active);
      storiesRef.current = active;
    }

    setSegmentProgress(0);
    setCurrentIndex((idx) => {
      const next = idx + 1;
      if (next >= active.length) {
        queueMicrotask(() => {
          onStoriesConsumed?.();
          closeViewer();
        });
        return idx;
      }
      return next;
    });
  }, [closeViewer, onStoriesConsumed]);

  const advanceStoryRef = useRef(advanceStory);
  advanceStoryRef.current = advanceStory;

  useEffect(() => {
    if (!open || !userId) {
      setLoadState("idle");
      setStories([]);
      setCurrentIndex(0);
      setSegmentProgress(0);
      setPaused(false);
      setHolding(false);
      markedViewRef.current.clear();
      return;
    }

    let cancelled = false;
    setLoadState("loading");
    setStories([]);
    setCurrentIndex(0);
    setSegmentProgress(0);
    markedViewRef.current.clear();

    void fetchUserStories(userId)
      .then((list) => {
        if (cancelled) return;
        if (list.length === 0) {
          closeViewer();
          return;
        }
        const start = Math.min(Math.max(0, initialStoryIndex), list.length - 1);
        setStories(list);
        setCurrentIndex(start);
        setLoadState("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setLoadState("error");
          closeViewer();
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, userId, initialStoryIndex, closeViewer]);

  useEffect(() => {
    if (!open || !currentStory) return;
    if (markedViewRef.current.has(currentStory.id)) return;
    markedViewRef.current.add(currentStory.id);
    void markStoryViewed(currentStory.id);
  }, [open, currentStory?.id, currentStory]);

  useEffect(() => {
    if (!open || loadState !== "ready" || !currentStory) return;
    if (!isStoryNotExpired(currentStory)) {
      advanceStory();
    }
  }, [open, loadState, currentStory?.id, currentStory?.expiresAt, advanceStory]);

  useEffect(() => {
    if (staticTimerRef.current) {
      clearInterval(staticTimerRef.current);
      staticTimerRef.current = null;
    }
    if (!open || !currentStory || isPaused) return;
    if (currentStory.mediaType === "video") return;

    staticStartedRef.current = performance.now();
    const tickMs = reduceMotion ? 120 : 50;
    staticTimerRef.current = setInterval(() => {
      const elapsed = performance.now() - staticStartedRef.current;
      const p = Math.min(1, elapsed / STORY_STATIC_DURATION_MS);
      setSegmentProgress(p);
      if (p >= 1) advanceStoryRef.current();
    }, tickMs);

    return () => {
      if (staticTimerRef.current) clearInterval(staticTimerRef.current);
    };
  }, [open, currentStory?.id, currentStory?.mediaType, isPaused, reduceMotion]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeViewer();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        advanceStory();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeViewer, advanceStory, goPrev]);

  useEffect(() => {
    if (!open) return;
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [open]);

  const handleTapZone = (side: "left" | "right") => (e: ReactMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (side === "left") {
      if (hasPrev) goPrev();
    } else {
      advanceStory();
    }
  };

  const author = currentStory?.author;
  const displayName = author?.name ?? "Utilizadora";
  const username = author?.username ? `@${author.username}` : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-black/90 backdrop-blur-sm"
        className={cn(
          "fixed inset-0 z-[101] flex h-[100dvh] w-full max-w-none flex-col",
          "left-0 top-0 translate-x-0 translate-y-0 rounded-none border-0 p-0",
          "bg-black text-white shadow-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        )}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Stories de {displayName}</DialogTitle>
        <DialogDescription className="sr-only">
          Visualizador de stories. Use as setas ou toque nas laterais para navegar. Escape para fechar.
        </DialogDescription>

        {loadState === "loading" ? (
          <div className="flex flex-1 items-center justify-center text-white/70">
            <span className="text-sm">A carregar stories…</span>
          </div>
        ) : null}

        {loadState === "ready" && stories.length > 0 ? (
          <>
            <div
              className="absolute inset-x-0 top-0 z-20 flex gap-1 px-2 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))]"
              aria-hidden
            >
              {stories.map((s, i) => {
                let fill = 0;
                if (i < currentIndex) fill = 1;
                else if (i === currentIndex) fill = segmentProgress;
                return (
                  <div
                    key={s.id}
                    className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25"
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-[var(--woody-nav)] transition-[width] duration-75 ease-linear"
                      style={{ width: `${fill * 100}%` }}
                    />
                  </div>
                );
              })}
            </div>

            <header className="relative z-20 flex items-center gap-3 px-3 pb-2 pt-10 sm:px-4 sm:pt-11">
              {author ? (
                <Link
                  to={`/profile/${author.id}`}
                  className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl py-1 pr-2 transition-colors hover:bg-white/8"
                  onClick={closeViewer}
                >
                  <StoryRing
                    avatarUrl={author.avatarUrl}
                    displayName={displayName}
                    hasActiveStories
                    size="sm"
                    className="shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                    <p className="truncate text-xs text-white/70">
                      {username}
                      {currentStory?.createdAt ? (
                        <>
                          {" · "}
                          {formatRelativeTimeUtc(currentStory.createdAt)}
                        </>
                      ) : null}
                    </p>
                  </div>
                </Link>
              ) : null}
              <button
                type="button"
                onClick={closeViewer}
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm",
                  woodyFocus.ring
                )}
                aria-label="Fechar stories"
              >
                <X className="size-5" aria-hidden />
              </button>
            </header>

            <div className="relative flex min-h-0 flex-1 flex-col">
              <div className="relative z-0 min-h-0 flex-1">
                {stories.map((story, i) => (
                  <div
                    key={story.id}
                    className={cn(
                      "absolute inset-0 transition-opacity duration-200",
                      i === currentIndex ? "opacity-100" : "pointer-events-none opacity-0"
                    )}
                    aria-hidden={i !== currentIndex}
                  >
                    <StoryViewerSlide
                      ref={i === currentIndex ? slideRef : undefined}
                      story={story}
                      isActive={i === currentIndex}
                      paused={isPaused}
                      onVideoEnded={() => advanceStory()}
                      onVideoTimeUpdate={(p) => setSegmentProgress(p)}
                    />
                  </div>
                ))}
              </div>

              <div className="absolute inset-0 z-20 flex">
                <button
                  type="button"
                  className="h-full w-[30%] max-w-[140px] shrink-0 cursor-pointer border-0 bg-transparent p-0"
                  aria-label="Story anterior"
                  onClick={handleTapZone("left")}
                  disabled={!hasPrev}
                />
                <div
                  className="min-w-0 flex-1 touch-none"
                  onPointerDown={() => setHolding(true)}
                  onPointerUp={() => setHolding(false)}
                  onPointerCancel={() => setHolding(false)}
                  onPointerLeave={() => setHolding(false)}
                />
                <button
                  type="button"
                  className="h-full w-[30%] max-w-[140px] shrink-0 cursor-pointer border-0 bg-transparent p-0"
                  aria-label="Próximo story"
                  onClick={handleTapZone("right")}
                />
              </div>

              {hasPrev ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                  className={cn(
                    "absolute left-1 top-1/2 z-30 flex -translate-y-1/2",
                    "size-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm sm:left-2 sm:size-10",
                    "transition-colors hover:bg-black/60",
                    woodyFocus.ring
                  )}
                  aria-label="Story anterior"
                >
                  <ChevronLeft className="size-5 sm:size-6" aria-hidden />
                </button>
              ) : null}

              {stories.length > 1 ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    advanceStory();
                  }}
                  className={cn(
                    "absolute right-1 top-1/2 z-30 flex -translate-y-1/2",
                    "size-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm sm:right-2 sm:size-10",
                    "transition-colors hover:bg-black/60",
                    woodyFocus.ring
                  )}
                  aria-label="Próximo story"
                >
                  <ChevronRight className="size-5 sm:size-6" aria-hidden />
                </button>
              ) : null}
            </div>

            <div className="pointer-events-none h-[max(0.5rem,env(safe-area-inset-bottom))] shrink-0" />
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
