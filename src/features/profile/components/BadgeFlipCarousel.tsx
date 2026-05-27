import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/features/landing/motion/usePrefersReducedMotion";
import type { UserBadge } from "../types";
import { BadgeIcon } from "./BadgeDetailDialog";

const SWIPE_THRESHOLD_PX = 52;
const DRAG_RANGE_PX = 130;
const FLIP_MS = 320;
const FLIP_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

export interface BadgeFlipCarouselProps {
  badges: UserBadge[];
  initialIndex: number;
  onIndexChange?: (index: number) => void;
  className?: string;
}

type FlipDirection = "next" | "prev";

interface FlipFaceTransform {
  rotateY: number;
  scale: number;
  translateZ: number;
  opacity: number;
  zIndex: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Interpola rotação, profundidade e escala para a próxima insígnia “chegar” em 3D. */
function computeFlipTransforms(
  progress: number,
  direction: FlipDirection
): { outgoing: FlipFaceTransform; incoming: FlipFaceTransform } {
  const t = clamp(progress, 0, 1);

  const angle = t * 90;
  const outgoingRotateY = direction === "next" ? -angle : angle;
  const incomingRotateY = direction === "next" ? 90 - angle : -90 + angle;

  const outgoingScale = 1 - t * 0.11;
  const incomingScale = 0.84 + t * 0.16;

  const outgoingZ = -t * 42;
  const incomingZ = (1 - t) * -64;

  const outgoingOpacity = t < 0.55 ? 1 : 1 - (t - 0.55) / 0.45;
  const incomingOpacity = t < 0.12 ? t / 0.12 : 1;

  const incomingOnTop = t >= 0.42;

  return {
    outgoing: {
      rotateY: outgoingRotateY,
      scale: outgoingScale,
      translateZ: outgoingZ,
      opacity: outgoingOpacity,
      zIndex: incomingOnTop ? 1 : 2,
    },
    incoming: {
      rotateY: incomingRotateY,
      scale: incomingScale,
      translateZ: incomingZ,
      opacity: incomingOpacity,
      zIndex: incomingOnTop ? 2 : 1,
    },
  };
}

function BadgeFlipFace({
  badge,
  transform,
  transition,
}: {
  badge: UserBadge;
  transform: FlipFaceTransform;
  transition: boolean;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 [backface-visibility:hidden] will-change-[transform,opacity]",
        transition && "transition-[transform,opacity]"
      )}
      style={{
        transform: `translateZ(${transform.translateZ}px) rotateY(${transform.rotateY}deg) scale(${transform.scale})`,
        opacity: transform.opacity,
        zIndex: transform.zIndex,
        transitionDuration: transition ? `${FLIP_MS}ms` : undefined,
        transitionTimingFunction: transition ? FLIP_EASING : undefined,
      }}
    >
      <BadgeIcon
        badge={badge}
        className="size-32 rounded-full"
        imageClassName="size-32 h-full w-full rounded-full object-cover"
      />
    </div>
  );
}

export function BadgeFlipCarousel({
  badges,
  initialIndex,
  onIndexChange,
  className,
}: BadgeFlipCarouselProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(initialIndex);
  const [dragX, setDragX] = useState(0);
  const [snapProgress, setSnapProgress] = useState(0);
  const [snapDirection, setSnapDirection] = useState<FlipDirection | null>(null);
  const [snapTargetIndex, setSnapTargetIndex] = useState<number | null>(null);
  const [isSnapping, setIsSnapping] = useState(false);
  const pointerActive = useRef(false);
  const startX = useRef(0);
  const flipLayerRef = useRef<HTMLDivElement>(null);
  const snapFinishedRef = useRef(false);

  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  const canGoPrev = index > 0;
  const canGoNext = index < badges.length - 1;

  const dragDirection: FlipDirection | null =
    dragX < 0 && canGoNext ? "next" : dragX > 0 && canGoPrev ? "prev" : null;

  const dragProgress =
    dragDirection === "next"
      ? clamp(-dragX / DRAG_RANGE_PX, 0, 1)
      : dragDirection === "prev"
        ? clamp(dragX / DRAG_RANGE_PX, 0, 1)
        : 0;

  const direction = isSnapping ? snapDirection : dragDirection;
  const progress = isSnapping ? snapProgress : dragProgress;

  const incomingIndex =
    direction === "next" ? index + 1 : direction === "prev" ? index - 1 : null;

  const finishSnap = useCallback(() => {
    if (snapTargetIndex != null) {
      setIndex(snapTargetIndex);
    }
    setIsSnapping(false);
    setSnapDirection(null);
    setSnapTargetIndex(null);
    setSnapProgress(0);
    setDragX(0);
  }, [snapTargetIndex]);

  useEffect(() => {
    const node = flipLayerRef.current;
    if (!node || !isSnapping) return;

    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName !== "transform") return;
      if (snapFinishedRef.current) return;
      snapFinishedRef.current = true;
      finishSnap();
    };

    const fallback = window.setTimeout(() => {
      if (!snapFinishedRef.current) {
        snapFinishedRef.current = true;
        finishSnap();
      }
    }, FLIP_MS + 50);

    node.addEventListener("transitionend", onTransitionEnd);
    return () => {
      node.removeEventListener("transitionend", onTransitionEnd);
      window.clearTimeout(fallback);
    };
  }, [isSnapping, finishSnap]);

  const startSnap = useCallback(
    (targetIndex: number | null, dir: FlipDirection, fromProgress: number, toProgress: number) => {
      if (prefersReducedMotion && targetIndex != null) {
        setIndex(targetIndex);
        setDragX(0);
        return;
      }

      snapFinishedRef.current = false;
      setIsSnapping(true);
      setSnapDirection(dir);
      setSnapTargetIndex(targetIndex);
      setSnapProgress(fromProgress);
      setDragX(0);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => setSnapProgress(toProgress));
      });
    },
    [prefersReducedMotion]
  );

  const finishDrag = useCallback(() => {
    if (dragDirection === "next" && dragProgress >= SWIPE_THRESHOLD_PX / DRAG_RANGE_PX) {
      startSnap(index + 1, "next", dragProgress, 1);
      return;
    }
    if (dragDirection === "prev" && dragProgress >= SWIPE_THRESHOLD_PX / DRAG_RANGE_PX) {
      startSnap(index - 1, "prev", dragProgress, 1);
      return;
    }
    if (dragProgress > 0 && dragDirection) {
      startSnap(null, dragDirection, dragProgress, 0);
    } else {
      setDragX(0);
    }
  }, [dragDirection, dragProgress, index, startSnap]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isSnapping || badges.length <= 1) return;
    pointerActive.current = true;
    startX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerActive.current || isSnapping) return;
    let delta = event.clientX - startX.current;
    if (delta < 0 && !canGoNext) delta *= 0.25;
    if (delta > 0 && !canGoPrev) delta *= 0.25;
    setDragX(delta);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerActive.current) return;
    pointerActive.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    finishDrag();
  };

  const currentBadge = badges[index];
  const incomingBadge =
    incomingIndex != null && progress > 0 ? badges[incomingIndex] : null;

  const idleTransform: FlipFaceTransform = {
    rotateY: 0,
    scale: 1,
    translateZ: 0,
    opacity: 1,
    zIndex: 1,
  };

  const flipTransforms =
    incomingBadge && direction
      ? computeFlipTransforms(progress, direction)
      : null;

  return (
    <div className={cn("w-full", className)}>
      <div
        className="relative mx-auto flex h-36 w-full max-w-[16rem] touch-none select-none items-center justify-center"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        aria-roledescription="carrossel"
        aria-label={`Insígnia ${index + 1} de ${badges.length}: ${currentBadge.name}`}
      >
        <div className="relative size-32 [perspective:1200px]">
          <div
            ref={flipLayerRef}
            className="relative size-32 [transform-style:preserve-3d]"
          >
            <BadgeFlipFace
              badge={currentBadge}
              transform={flipTransforms?.outgoing ?? idleTransform}
              transition={isSnapping}
            />

            {incomingBadge && flipTransforms ? (
              <BadgeFlipFace
                badge={incomingBadge}
                transform={flipTransforms.incoming}
                transition={isSnapping}
              />
            ) : null}
          </div>
        </div>
      </div>

      {badges.length > 1 ? (
        <div className="mt-2 flex items-center justify-center gap-1.5" aria-hidden>
          {badges.map((badge, dotIndex) => (
            <span
              key={badge.slug}
              className={cn(
                "size-1.5 rounded-full transition-colors duration-300",
                dotIndex === index
                  ? "bg-[var(--woody-text)]"
                  : "bg-[var(--woody-divider)]"
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
