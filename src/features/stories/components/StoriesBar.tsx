import { Plus } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";
import { StoryRing } from "@/components/ui/StoryRing";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { resolvePublicMediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import type { StoryFeedItem } from "../types";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function truncateLabel(value: string, max = 10): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

const scrollClass = cn(
  "flex gap-3 overflow-x-auto overscroll-x-contain py-1",
  "scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  "snap-x snap-mandatory"
);

/** Alinhado ao tamanho `bar` do StoryRing (foto + anéis). */
const AVATAR_SIZE_CLASS = "size-[3.625rem]";
const itemShellClass = "flex w-[5.25rem] shrink-0 snap-start flex-col items-center";
const addBadgeClass =
  "absolute -bottom-0.5 -right-0.5 flex size-7 items-center justify-center rounded-full border-2 border-[var(--woody-bg)] bg-[var(--woody-nav)] text-white shadow-sm";

export interface StoriesBarProps {
  className?: string;
  isLoading?: boolean;
  selfUser?: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl?: string | null;
  } | null;
  others: StoryFeedItem[];
  selfFeedItem?: StoryFeedItem | null;
  onOpenUserStories: (userId: string) => void;
  onAddStory: () => void;
}

export function StoriesBar({
  className,
  isLoading = false,
  selfUser,
  others,
  selfFeedItem,
  onOpenUserStories,
  onAddStory,
}: StoriesBarProps) {
  const selfHasStories = selfFeedItem?.hasActiveStories ?? false;
  const selfHasUnviewed = selfFeedItem?.hasUnviewedStories ?? false;
  const selfAvatar = selfFeedItem?.avatarUrl ?? selfUser?.avatarUrl ?? null;
  const selfName = selfFeedItem?.displayName ?? selfUser?.displayName ?? "Você";
  const selfLabel = selfHasStories ? "Seu story" : "Adicionar";

  if (isLoading) {
    return (
      <div className={cn("w-full min-w-0", className)} aria-busy aria-label="A carregar stories">
        <div className={scrollClass}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={itemShellClass}>
              <Skeleton className={cn(AVATAR_SIZE_CLASS, "rounded-full bg-[var(--woody-nav)]/12")} />
              <Skeleton className="mt-2 h-2.5 w-14 rounded bg-[var(--woody-nav)]/10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!selfUser && others.length === 0) return null;

  return (
    <div className={cn("w-full min-w-0", className)}>
      <div className={scrollClass}>
        {selfUser ? (
          <StoriesBarItem
            label={selfLabel}
            onActivate={() => {
              if (selfHasStories) onOpenUserStories(selfUser.id);
              else onAddStory();
            }}
          >
            <SelfStoryAvatar
              avatarUrl={selfAvatar}
              displayName={selfName}
              hasActiveStories={selfHasStories}
              hasUnviewedStories={selfHasUnviewed}
              onAddStory={onAddStory}
              onViewStories={() => onOpenUserStories(selfUser.id)}
            />
          </StoriesBarItem>
        ) : null}

        {others.map((item) => (
          <StoriesBarItem
            key={item.userId}
            label={truncateLabel(item.username || item.displayName)}
            onActivate={() => onOpenUserStories(item.userId)}
          >
            <StoryRing
              avatarUrl={item.avatarUrl}
              displayName={item.displayName}
              hasActiveStories={item.hasActiveStories}
              hasUnviewedStories={item.hasUnviewedStories}
              size="bar"
            />
          </StoriesBarItem>
        ))}
      </div>
    </div>
  );
}

function StoriesBarItem({
  label,
  onActivate,
  children,
}: {
  label: string;
  onActivate: () => void;
  children: ReactNode;
}) {
  return (
    <div className={itemShellClass}>
      <button
        type="button"
        onClick={onActivate}
        className={cn("group flex flex-col items-center gap-1.5", woodyFocus.ring)}
      >
        {children}
        <span className="max-w-[5.25rem] truncate text-center text-xs font-medium leading-tight text-[var(--woody-muted)] group-hover:text-[var(--woody-text)]">
          {label}
        </span>
      </button>
    </div>
  );
}

function SelfStoryAvatar({
  avatarUrl,
  displayName,
  hasActiveStories,
  hasUnviewedStories,
  onAddStory,
  onViewStories,
}: {
  avatarUrl?: string | null;
  displayName: string;
  hasActiveStories: boolean;
  hasUnviewedStories: boolean;
  onAddStory: () => void;
  onViewStories: () => void;
}) {
  if (hasActiveStories) {
    return (
      <div className="relative inline-flex">
        <StoryRing
          avatarUrl={avatarUrl}
          displayName={displayName}
          hasActiveStories
          hasUnviewedStories={hasUnviewedStories}
          size="bar"
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            onViewStories();
          }}
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddStory();
          }}
          className={cn(addBadgeClass, "transition-transform hover:scale-105 active:scale-95", woodyFocus.ring)}
          aria-label="Adicionar story"
        >
          <Plus className="size-4 stroke-[2.5]" aria-hidden />
        </button>
      </div>
    );
  }

  const resolved = avatarUrl ? resolvePublicMediaUrl(avatarUrl) : undefined;
  return (
    <div className="relative inline-flex">
      <Avatar
        className={cn(
          AVATAR_SIZE_CLASS,
          "overflow-hidden rounded-full border border-black/[0.06] bg-[var(--woody-card)]"
        )}
      >
        {resolved ? (
          <AvatarImage src={resolved} alt="" className="size-full object-cover object-center" />
        ) : null}
        <AvatarFallback className="bg-[var(--woody-nav)]/12 text-sm font-semibold text-[var(--woody-nav)]">
          {getInitials(displayName)}
        </AvatarFallback>
      </Avatar>
      <span className={addBadgeClass} aria-hidden>
        <Plus className="size-4 stroke-[2.5]" />
      </span>
    </div>
  );
}
