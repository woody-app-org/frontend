import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import type { ConversationResponseDto } from "../types";
import { formatConversationListTime } from "../lib/formatShortTime";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export interface ConversationListItemProps {
  conversation: ConversationResponseDto;
  selected: boolean;
  onSelect: () => void;
}

export function ConversationListItem({ conversation, selected, onSelect }: ConversationListItemProps) {
  const peer = conversation.otherUser;
  const label = peer.displayName ?? peer.username;
  const preview =
    conversation.lastMessagePreview?.trim() ||
    (conversation.status === "pending" ? "À espera de resposta" : "Sem mensagens ainda");
  const timeLabel = formatConversationListTime(conversation.lastMessageAt ?? conversation.updatedAt);

  return (
    <li className="list-none">
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          woodyFocus.ring,
          "flex w-full min-w-0 items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors touch-manipulation",
          selected
            ? "bg-[var(--woody-nav)]/12 ring-1 ring-[var(--woody-nav)]/20"
            : "hover:bg-[var(--woody-nav)]/6 active:bg-[var(--woody-nav)]/10"
        )}
      >
        <Avatar className="size-12 shrink-0 border border-[var(--woody-accent)]/15">
          <AvatarImage src={peer.profilePic ?? undefined} alt="" />
          <AvatarFallback className="bg-[var(--woody-nav)]/10 text-sm font-medium text-[var(--woody-text)]">
            {initials(label)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate font-semibold text-[var(--woody-text)]">{label}</p>
              {conversation.status === "pending" ? (
                <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-amber-900/90">
                  Pendente
                </span>
              ) : null}
            </div>
            {timeLabel ? (
              <time
                className="shrink-0 text-[0.7rem] tabular-nums text-[var(--woody-muted)]"
                dateTime={conversation.lastMessageAt ?? conversation.updatedAt ?? undefined}
              >
                {timeLabel}
              </time>
            ) : null}
          </div>
          <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-[var(--woody-muted)]">{preview}</p>
        </div>
      </button>
    </li>
  );
}
