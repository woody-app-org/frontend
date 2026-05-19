import { useMemo, type MouseEvent, type ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePrefersReducedMotion } from "@/features/landing/motion/usePrefersReducedMotion";
import { resolvePublicMediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";

export type StoryRingSize = "sm" | "md" | "bar" | "lg" | "xl";

/** Altura/largura do círculo externo no tamanho `bar` (foto + margens + aro). */
export const STORY_RING_BAR_OUTER_CLASS = "size-[4.3125rem]";

export interface StoryRingProps {
  avatarUrl?: string | null;
  displayName: string;
  hasActiveStories?: boolean;
  /** Quando omitido e há stories ativos, trata-se como não visualizado (aro mais vivo). */
  hasUnviewedStories?: boolean;
  /**
   * Mesmo diâmetro do aro ativo, com borda neutra — alinha “Adicionar” na StoriesBar.
   * Só faz efeito quando `hasActiveStories` é false.
   */
  placeholderRing?: boolean;
  size?: StoryRingSize;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  /** Classes extra no Avatar interno (ex.: borda do perfil). */
  avatarClassName?: string;
}

const SIZE_STYLES: Record<
  StoryRingSize,
  { avatar: string; fallback: string; ringPad: string; innerPad: string }
> = {
  sm: {
    avatar: "size-8",
    fallback: "text-[10px]",
    ringPad: "p-[2px]",
    innerPad: "p-[1.5px]",
  },
  md: {
    avatar: "size-9 md:size-10",
    fallback: "text-xs",
    ringPad: "p-[2px]",
    innerPad: "p-[1.5px]",
  },
  /** Barra horizontal de stories no feed (estilo rede social). */
  bar: {
    avatar: "size-[3.625rem]",
    fallback: "text-sm font-semibold",
    ringPad: "p-[3px]",
    innerPad: "p-[2.5px]",
  },
  lg: {
    avatar: "size-24 sm:size-28",
    fallback: "text-xl font-bold",
    ringPad: "p-[2.5px]",
    innerPad: "p-[2px]",
  },
  xl: {
    avatar: "size-32",
    fallback: "text-2xl font-bold",
    ringPad: "p-[3px]",
    innerPad: "p-[2px]",
  },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ringToneClass(hasUnviewedStories: boolean | undefined): string {
  const unviewed = hasUnviewedStories !== false;
  return unviewed
    ? "bg-gradient-to-tr from-emerald-500 via-[var(--woody-nav)] to-teal-500 shadow-[0_0_0_1px_rgba(139,195,74,0.35)]"
    : "bg-gradient-to-tr from-[var(--woody-nav)]/50 via-[var(--woody-nav)]/38 to-[var(--woody-nav)]/50 shadow-[0_0_0_1px_rgba(139,195,74,0.18)]";
}

function AvatarClip({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={className}>{children}</div>;
}

export function StoryRing({
  avatarUrl,
  displayName,
  hasActiveStories = false,
  hasUnviewedStories,
  placeholderRing = false,
  size = "md",
  onClick,
  className,
  avatarClassName,
}: StoryRingProps) {
  const reduceMotion = usePrefersReducedMotion();
  const sizeStyle = SIZE_STYLES[size];
  const useBarOuter = size === "bar";

  const resolvedAvatarUrl = useMemo(
    () => (avatarUrl ? resolvePublicMediaUrl(avatarUrl) : ""),
    [avatarUrl]
  );

  const avatarFace = (
    <Avatar
      className={cn(
        "size-full rounded-full bg-[var(--woody-card)]",
        !hasActiveStories && !placeholderRing && "ring-2 ring-[var(--woody-card)]",
        avatarClassName
      )}
    >
      <AvatarImage
        src={resolvedAvatarUrl || undefined}
        alt={displayName}
        className="size-full object-cover object-center"
      />
      <AvatarFallback
        className={cn(
          "rounded-full bg-[var(--woody-nav)]/10 font-semibold text-[var(--woody-text)]",
          sizeStyle.fallback
        )}
      >
        {getInitials(displayName)}
      </AvatarFallback>
    </Avatar>
  );

  const clickMotion =
    !reduceMotion && hasActiveStories && hasUnviewedStories !== false
      ? "transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
      : undefined;

  const sizedClip = (child: ReactNode) => (
    <AvatarClip className={cn(sizeStyle.avatar, "overflow-hidden rounded-full")}>{child}</AvatarClip>
  );

  if (!hasActiveStories) {
    const idle = onClick ? (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "block shrink-0 rounded-full border-0 bg-transparent p-0 leading-none touch-manipulation",
          sizeStyle.avatar,
          woodyFocus.ring
        )}
        aria-label={`Ver stories de ${displayName}`}
      >
        {avatarFace}
      </button>
    ) : (
      sizedClip(avatarFace)
    );

    if (placeholderRing) {
      return (
        <div
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full",
            sizeStyle.ringPad,
            "bg-[var(--woody-nav)]/22",
            useBarOuter && STORY_RING_BAR_OUTER_CLASS,
            className
          )}
        >
          <div
            className={cn(
              "flex items-center justify-center overflow-hidden rounded-full bg-[var(--woody-card)]",
              sizeStyle.innerPad
            )}
          >
            {idle}
          </div>
        </div>
      );
    }

    return <div className={cn("inline-flex shrink-0", className)}>{idle}</div>;
  }

  const ringedInteractive = onClick ? (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "block shrink-0 rounded-full border-0 bg-transparent p-0 leading-none touch-manipulation",
        sizeStyle.avatar,
        woodyFocus.ring,
        clickMotion
      )}
      aria-label={`Ver stories de ${displayName}`}
    >
      {avatarFace}
    </button>
  ) : (
    sizedClip(avatarFace)
  );

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        sizeStyle.ringPad,
        ringToneClass(hasUnviewedStories),
        useBarOuter && STORY_RING_BAR_OUTER_CLASS,
        className
      )}
      data-has-active-stories="true"
    >
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-full bg-[var(--woody-card)]",
          sizeStyle.innerPad
        )}
      >
        {ringedInteractive}
      </div>
    </div>
  );
}
