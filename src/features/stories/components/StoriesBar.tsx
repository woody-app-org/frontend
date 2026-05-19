import { Plus } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";
import { StoryRing, STORY_RING_BAR_OUTER_CLASS } from "@/components/ui/StoryRing";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import type { StoryFeedItem } from "../types";

function truncateLabel(value: string, max = 10): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

const scrollClass = cn(
  "flex items-start gap-3 overflow-x-auto overscroll-x-contain py-1",
  "scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  "snap-x snap-mandatory"
);

const itemShellClass = "flex w-[5.25rem] shrink-0 snap-start flex-col items-center";
const addBadgeClass =
  "absolute -bottom-0.5 -right-0.5 z-10 flex size-7 items-center justify-center rounded-full border-2 border-[var(--woody-bg)] bg-[var(--woody-nav)] text-white shadow-sm";

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
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={itemShellClass}>
              <Skeleton className={cn(STORY_RING_BAR_OUTER_CLASS, "rounded-full bg-[var(--woody-nav)]/12")} />
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
        className={cn("group flex w-full flex-col items-center gap-1.5", woodyFocus.ring)}
      >
        <div className={cn("flex items-center justify-center", STORY_RING_BAR_OUTER_CLASS)}>{children}</div>
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
  return (
    <div className={cn("relative flex items-center justify-center", STORY_RING_BAR_OUTER_CLASS)}>
      <StoryRing
        avatarUrl={avatarUrl}
        displayName={displayName}
        hasActiveStories={hasActiveStories}
        hasUnviewedStories={hasUnviewedStories}
        placeholderRing={!hasActiveStories}
        size="bar"
        onClick={
          hasActiveStories
            ? (e: MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                onViewStories();
              }
            : undefined
        }
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
