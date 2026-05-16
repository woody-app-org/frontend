import { ChevronRight, ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatRelativeTimeUtc } from "@/lib/formatRelativeTimeUtc";
import type { NotificationItem } from "../services/notifications.service";

export interface NotificationListItemProps {
  item: NotificationItem;
  summary: string;
  hasDestination: boolean;
  onActivate: () => void;
}

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";
}

/**
 * Uma linha da lista (avatar, texto, tempo, indicador, chevron).
 */
export function NotificationListItem({ item, summary, hasDestination, onActivate }: NotificationListItemProps) {
  const actor = item.actor;
  const name = actor?.displayName?.trim() || "Alguém";
  const unread = !item.readAt;
  const showContextThumb =
    item.type === "post_like" || item.type === "post_comment" || item.type === "comment_reply";

  return (
    <li>
      <button
        type="button"
        onClick={onActivate}
        className={cn(
          "flex w-full cursor-pointer items-start gap-3 border-l-[3px] py-3 pl-[calc(0.75rem-3px)] pr-3 text-left transition-colors",
          unread
            ? "border-[var(--woody-nav)] bg-black/[0.02] dark:bg-white/[0.03]"
            : "border-transparent",
          "hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--woody-accent)]/30",
          !hasDestination ? "opacity-90" : ""
        )}
      >
        <Avatar className="size-11 shrink-0 ring-1 ring-black/[0.04] dark:ring-white/[0.08]">
          <AvatarImage src={actor?.avatar ?? undefined} alt="" />
          <AvatarFallback className="bg-[var(--woody-nav)]/14 text-xs font-semibold text-[var(--woody-text)]">
            {initialsFromName(name)}
          </AvatarFallback>
        </Avatar>

        <span className="min-w-0 flex-1">
          <span className="line-clamp-3 text-[0.9375rem] leading-snug text-[var(--woody-text)]">{summary}</span>
          <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs tabular-nums text-[var(--woody-muted)]">
            <span>{formatRelativeTimeUtc(item.createdAt)}</span>
            {showContextThumb ? (
              <span className="inline-flex items-center gap-0.5 rounded-md bg-black/[0.04] px-1.5 py-0.5 text-[0.65rem] font-medium text-[var(--woody-muted)] dark:bg-white/[0.06]">
                <ImageIcon className="size-3 opacity-80" aria-hidden />
                Post
              </span>
            ) : null}
          </span>
        </span>

        <span className="flex shrink-0 flex-col items-end gap-2 pt-1">
          {unread ? (
            <span className="size-2 rounded-full bg-[var(--woody-nav)] shadow-sm" aria-label="Não lida" />
          ) : (
            <span className="size-2 shrink-0" aria-hidden />
          )}
          {hasDestination ? (
            <ChevronRight className="size-4 text-[var(--woody-muted)] opacity-80" aria-hidden />
          ) : (
            <span className="size-4 shrink-0" aria-hidden />
          )}
        </span>
      </button>
    </li>
  );
}
