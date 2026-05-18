import { useMemo, type MouseEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePrefersReducedMotion } from "@/features/landing/motion/usePrefersReducedMotion";
import { resolvePublicMediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";

export type StoryRingSize = "sm" | "md" | "lg" | "xl";

export interface StoryRingProps {
  avatarUrl?: string | null;
  displayName: string;
  hasActiveStories?: boolean;
  /** Quando omitido e há stories ativos, trata-se como não visualizado (aro mais vivo). */
  hasUnviewedStories?: boolean;
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

export function StoryRing({
  avatarUrl,
  displayName,
  hasActiveStories = false,
  hasUnviewedStories,
  size = "md",
  onClick,
  className,
  avatarClassName,
}: StoryRingProps) {
  const reduceMotion = usePrefersReducedMotion();
  const sizeStyle = SIZE_STYLES[size];

  const resolvedAvatarUrl = useMemo(
    () => (avatarUrl ? resolvePublicMediaUrl(avatarUrl) : ""),
    [avatarUrl]
  );

  const avatarNode = (
    <Avatar
      className={cn(
        sizeStyle.avatar,
        "rounded-full bg-[var(--woody-card)] ring-2 ring-[var(--woody-card)]",
        avatarClassName
      )}
    >
      <AvatarImage src={resolvedAvatarUrl || undefined} alt={displayName} />
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

  const content = onClick ? (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full touch-manipulation",
        woodyFocus.ring,
        !reduceMotion &&
          hasActiveStories &&
          hasUnviewedStories !== false &&
          "transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
      )}
      aria-label={`Ver stories de ${displayName}`}
    >
      {avatarNode}
    </button>
  ) : (
    avatarNode
  );

  if (!hasActiveStories) {
    return <div className={cn("inline-flex shrink-0", className)}>{content}</div>;
  }

  return (
    <div
      className={cn(
        "inline-flex shrink-0 rounded-full",
        sizeStyle.ringPad,
        ringToneClass(hasUnviewedStories),
        className
      )}
      data-has-active-stories="true"
    >
      <div className={cn("rounded-full bg-[var(--woody-card)]", sizeStyle.innerPad)}>{content}</div>
    </div>
  );
}
