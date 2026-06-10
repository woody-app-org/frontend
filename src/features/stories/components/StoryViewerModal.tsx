import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { Link } from "react-router-dom";
import { profilePathForUser } from "@/features/profile/lib/profilePaths";
import { ChevronLeft, ChevronRight, Eye, Music, Send, Volume2, VolumeX, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { StoryRing } from "@/components/ui/StoryRing";
import { PostLikeIcon } from "@/features/feed/components/PostLikeIcon";
import { usePostLikeTapAnimation } from "@/features/feed/hooks/usePostLikeTapAnimation";
import { formatRelativeTimeUtc } from "@/lib/formatRelativeTimeUtc";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { usePrefersReducedMotion } from "@/features/landing/motion/usePrefersReducedMotion";
import type { Story } from "../types";
import {
  filterActiveStories,
  isSameUserId,
  isStoryNotExpired,
  STORY_STATIC_DURATION_MS,
} from "../lib/storyUtils";
import { useAuth } from "@/features/auth/context/AuthContext";
import { fetchUserStories, markStoryViewed } from "../services/stories.service";
import { resolveDeezerPreviewUrl } from "../services/deezer.service";
import { dispatchStoriesChanged } from "../lib/storyEvents";
import { useStoryLikeToggle } from "../hooks/useStoryLikeToggle";
import { useStorySendMessage } from "../hooks/useStorySendMessage";
import { StoryViewerSlide, type StoryViewerSlideHandle } from "./StoryViewerSlide";
import { StoryViewerMoreMenu } from "./StoryViewerMoreMenu";
import { StoryViewersSheet } from "./StoryViewersSheet";

function formatStoryCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

export interface StoryViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  initialStoryIndex?: number;
  onStoriesConsumed?: () => void;
  /** Após excluir um story (ex.: refetch do perfil). */
  onStoryDeleted?: () => void;
}

export function StoryViewerModal({
  open,
  onOpenChange,
  userId,
  initialStoryIndex = 0,
  onStoriesConsumed,
  onStoryDeleted,
}: StoryViewerModalProps) {
  const { user: authUser } = useAuth();
  const reduceMotion = usePrefersReducedMotion();
  const [stories, setStories] = useState<Story[]>([]);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [segmentProgress, setSegmentProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [holding, setHolding] = useState(false);
  const [menuBlocked, setMenuBlocked] = useState(false);
  const [composerActive, setComposerActive] = useState(false);
  const [viewersOpen, setViewersOpen] = useState(false);

  const slideRef = useRef<StoryViewerSlideHandle>(null);
  const storiesRef = useRef<Story[]>([]);
  const markedViewRef = useRef<Set<string>>(new Set());
  const staticTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const staticStartedRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [muted, setMuted] = useState(false);
  // Vídeos sem música própria têm áudio nativo — começam mutados (autoplay exige isso
  // na maioria dos browsers) e a pessoa pode tocar para ativar o som.
  const [videoSoundOn, setVideoSoundOn] = useState(true);

  const currentStory = stories[currentIndex] ?? null;
  const isPaused = paused || holding || menuBlocked || composerActive || viewersOpen;
  const hasPrev = currentIndex > 0;

  const canDeleteCurrent = Boolean(
    authUser?.id &&
      currentStory &&
      (isSameUserId(currentStory.authorUserId, authUser.id) ||
        isSameUserId(currentStory.author.id, authUser.id))
  );

  const isOwnCurrentStory = canDeleteCurrent;

  const { tapPhase, triggerTap } = usePostLikeTapAnimation();
  const { toggleStoryLike, isStoryLikePending } = useStoryLikeToggle(setStories);
  const { message, setMessage, canSend, isSending, sendMessage } = useStorySendMessage(currentStory);

  useEffect(() => {
    storiesRef.current = stories;
  }, [stories]);

  const resetViewerState = useCallback(() => {
    setLoadState("idle");
    setStories([]);
    setCurrentIndex(0);
    setSegmentProgress(0);
    setPaused(false);
    setHolding(false);
    setMenuBlocked(false);
    setComposerActive(false);
    setViewersOpen(false);
    markedViewRef.current.clear();
  }, []);

  const closeViewer = useCallback(() => {
    resetViewerState();
    onOpenChange(false);
  }, [onOpenChange, resetViewerState]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) resetViewerState();
      onOpenChange(next);
    },
    [onOpenChange, resetViewerState]
  );

  const handleCurrentStoryDeleted = useCallback(() => {
    if (!currentStory) return;

    const deletedId = currentStory.id;
    const remaining = storiesRef.current.filter((s) => s.id !== deletedId);
    markedViewRef.current.delete(deletedId);

    dispatchStoriesChanged();
    onStoryDeleted?.();

    if (remaining.length === 0) {
      onStoriesConsumed?.();
      closeViewer();
      return;
    }

    setStories(remaining);
    storiesRef.current = remaining;
    setSegmentProgress(0);
    setCurrentIndex((idx) => Math.min(idx, remaining.length - 1));
  }, [currentStory, closeViewer, onStoriesConsumed, onStoryDeleted]);

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
  useEffect(() => {
    advanceStoryRef.current = advanceStory;
  }, [advanceStory]);

  useEffect(() => {
    if (!open || !userId) return;

    let cancelled = false;

    void Promise.resolve()
      .then(() => {
        if (cancelled) return;
        setLoadState("loading");
        setStories([]);
        setCurrentIndex(0);
        setSegmentProgress(0);
        markedViewRef.current.clear();
      })
      .then(() => fetchUserStories(userId))
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
  }, [open, currentStory]);

  useEffect(() => {
    if (!open || loadState !== "ready" || !currentStory) return;
    if (!isStoryNotExpired(currentStory)) {
      advanceStory();
    }
  }, [open, loadState, currentStory, advanceStory]);

  useEffect(() => {
    if (staticTimerRef.current) {
      clearInterval(staticTimerRef.current);
      staticTimerRef.current = null;
    }
    if (!open || !currentStory || isPaused) return;
    if (currentStory.mediaType === "video") return;

    staticStartedRef.current = performance.now();
    const music = currentStory.music;
    const durationMs = music
      ? Math.max(STORY_STATIC_DURATION_MS, (30 - (music.startTime ?? 0)) * 1000)
      : STORY_STATIC_DURATION_MS;
    const tickMs = reduceMotion ? 120 : 50;
    staticTimerRef.current = setInterval(() => {
      const elapsed = performance.now() - staticStartedRef.current;
      const p = Math.min(1, elapsed / durationMs);
      setSegmentProgress(p);
      if (p >= 1) advanceStoryRef.current();
    }, tickMs);

    return () => {
      if (staticTimerRef.current) clearInterval(staticTimerRef.current);
    };
  }, [open, currentStory, isPaused, reduceMotion]);

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

  // Gestão de áudio da música — gerida no modal para ter o z-index correto no badge.
  // Os URLs de preview da Deezer expiram (~1h) e ficam vinculados ao IP de quem os pediu,
  // por isso o backend faz streaming dos bytes (proxy) e aqui criamos um Object URL local —
  // que precisa de ser revogado para não acumular memória.
  useEffect(() => {
    const music = currentStory?.music;
    let objectUrl: string | null = null;

    const teardown = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
    };

    teardown();
    setAudioBlocked(false);
    setMuted(false);
    setVideoSoundOn(true);

    if (!music?.trackId || !open) return;

    let cancelled = false;

    void resolveDeezerPreviewUrl(music.trackId).then((url) => {
      if (cancelled || !url) return;
      objectUrl = url;

      const audio = new Audio(url);
      audio.currentTime = music.startTime ?? 0;
      audio.muted = false;
      audioRef.current = audio;

      if (!isPaused) {
        audio.play().catch(() => setAudioBlocked(true));
      }
    });

    return () => {
      cancelled = true;
      teardown();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStory?.id, currentStory?.music?.trackId, open]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPaused) {
      audio.pause();
    } else {
      audio.play().catch(() => setAudioBlocked(true));
    }
  }, [isPaused]);

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
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
            <span className="text-sm">Carregando stories…</span>
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

            <header className="relative z-20 flex items-center gap-3 px-3 pb-2 pt-5 sm:px-4 sm:pt-6">
              {author ? (
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    to={profilePathForUser(author)}
                    className="flex min-w-0 items-center gap-2.5 rounded-xl py-1 pr-2 transition-colors hover:bg-white/8"
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

                  {currentStory?.music ? (
                    <div className="flex min-w-0 items-center gap-1.5 py-0.5 pl-[3.125rem] pr-2">
                      <Music className="size-3 shrink-0 text-white/45" aria-hidden />
                      <p className="min-w-0 truncate text-[11px] leading-tight text-white/55">
                        <span className="font-medium text-white/80">{currentStory.music.title}</span>
                        {" — "}
                        {currentStory.music.artist}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const audio = audioRef.current;
                          if (audioBlocked) {
                            audio?.play().catch(() => undefined);
                            setAudioBlocked(false);
                            setMuted(false);
                          } else {
                            const next = !muted;
                            if (audio) audio.muted = next;
                            setMuted(next);
                          }
                        }}
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded-full transition-colors",
                          audioBlocked || muted
                            ? "bg-white/15 text-white hover:bg-white/25"
                            : "text-white/55 hover:text-white"
                        )}
                        aria-label={audioBlocked || muted ? "Ativar som da música" : "Mutar música"}
                      >
                        {audioBlocked || muted ? (
                          <VolumeX className="size-3.5" aria-hidden />
                        ) : (
                          <Volume2 className="size-3.5 animate-pulse" aria-hidden />
                        )}
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
              <div className="flex shrink-0 items-center gap-1">
                {(currentStory?.mediaType === "video" ||
                  (currentStory?.layers ?? []).some((l) => l.type === "video")) &&
                !currentStory?.music ? (
                  <button
                    type="button"
                    onClick={() => setVideoSoundOn((prev) => !prev)}
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm",
                      woodyFocus.ring
                    )}
                    aria-label={videoSoundOn ? "Desativar som do vídeo" : "Ativar som do vídeo"}
                  >
                    {videoSoundOn ? (
                      <Volume2 className="size-5 animate-pulse" aria-hidden />
                    ) : (
                      <VolumeX className="size-5" aria-hidden />
                    )}
                  </button>
                ) : null}
                {canDeleteCurrent && currentStory ? (
                  <StoryViewerMoreMenu
                    storyId={currentStory.id}
                    onDeleted={handleCurrentStoryDeleted}
                    onInteractionChange={setMenuBlocked}
                  />
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
              </div>
            </header>

            <div className="relative flex min-h-0 flex-1 flex-col">
              <div className="relative z-0 min-h-0 flex-1">
                {stories.map((story, i) => (
                  <div
                    key={story.id}
                    className={cn(
                      "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
                      i === currentIndex ? "opacity-100" : "pointer-events-none opacity-0"
                    )}
                    aria-hidden={i !== currentIndex}
                  >
                    <div className="relative aspect-[9/16] h-full max-h-full w-auto max-w-full overflow-hidden">
                      <StoryViewerSlide
                        ref={i === currentIndex ? slideRef : undefined}
                        story={story}
                        isActive={i === currentIndex}
                        paused={isPaused}
                        videoMuted={Boolean(story.music) || !videoSoundOn}
                        onVideoEnded={() => advanceStory()}
                        onVideoTimeUpdate={(p) => setSegmentProgress(p)}
                      />
                    </div>
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

            {currentStory && !isOwnCurrentStory && authUser ? (
              <div className="relative z-20 flex shrink-0 items-center gap-2 border-t border-white/10 bg-black/60 px-3 py-2 backdrop-blur-sm sm:px-4">
                <form
                  className="flex min-w-0 flex-1 items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void sendMessage();
                  }}
                >
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onFocus={() => setComposerActive(true)}
                    onBlur={() => setComposerActive(false)}
                    placeholder={`Enviar mensagem para ${displayName}…`}
                    aria-label={`Enviar mensagem para ${displayName} sobre este story`}
                    disabled={isSending}
                    className="h-10 min-w-0 flex-1 border-white/20 bg-white/10 text-sm text-white placeholder:text-white/50 focus-visible:border-white/40 focus-visible:ring-white/20"
                  />
                  <button
                    type="submit"
                    disabled={!canSend}
                    aria-label="Enviar mensagem"
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur-sm transition-colors",
                      "hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40",
                      woodyFocus.ring
                    )}
                  >
                    <Send className="size-[1.05em]" aria-hidden />
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => {
                    if (isStoryLikePending(currentStory.id)) return;
                    triggerTap(!currentStory.likedByCurrentUser);
                    void toggleStoryLike(currentStory);
                  }}
                  disabled={isStoryLikePending(currentStory.id)}
                  aria-pressed={currentStory.likedByCurrentUser}
                  aria-label={currentStory.likedByCurrentUser ? "Remover curtida do story" : "Curtir story"}
                  className={cn(
                    "flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-medium backdrop-blur-sm transition-colors",
                    currentStory.likedByCurrentUser
                      ? "bg-[var(--woody-accent)] text-white hover:bg-[var(--woody-accent)]/90"
                      : "bg-white/12 text-white hover:bg-white/20",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                    woodyFocus.ring
                  )}
                >
                  <PostLikeIcon
                    liked={currentStory.likedByCurrentUser}
                    tapPhase={tapPhase}
                    sizeClassName="size-[1.05em]"
                  />
                  {currentStory.likesCount > 0 ? (
                    <span>{formatStoryCount(currentStory.likesCount)}</span>
                  ) : null}
                </button>
              </div>
            ) : null}

            {currentStory && isOwnCurrentStory ? (
              <div className="relative z-20 flex shrink-0 items-center border-t border-white/10 bg-black/60 px-3 py-2 backdrop-blur-sm sm:px-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewersOpen(true);
                  }}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-full bg-white/12 px-3 text-sm font-medium text-white backdrop-blur-sm transition-colors",
                    "hover:bg-white/20",
                    woodyFocus.ring
                  )}
                >
                  <Eye className="size-[1.05em]" aria-hidden />
                  {formatStoryCount(currentStory.viewCount)}
                </button>
              </div>
            ) : null}

            <div className="pointer-events-none h-[env(safe-area-inset-bottom)] shrink-0" />
          </>
        ) : null}
      </DialogContent>

      {currentStory && isOwnCurrentStory ? (
        <StoryViewersSheet
          open={viewersOpen}
          onOpenChange={setViewersOpen}
          storyId={currentStory.id}
        />
      ) : null}
    </Dialog>
  );
}
