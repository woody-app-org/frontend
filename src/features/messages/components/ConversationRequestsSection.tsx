import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus, woodySection } from "@/lib/woody-ui";
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

export interface ConversationRequestsSectionProps {
  items: ConversationResponseDto[];
  selectedId: number | null;
  loading?: boolean;
  actionBusyId: number | null;
  onOpen: (id: number) => void;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}

export function ConversationRequestsSection({
  items,
  selectedId,
  loading,
  actionBusyId,
  onOpen,
  onAccept,
  onReject,
}: ConversationRequestsSectionProps) {
  if (loading) {
    return (
      <section className="flex flex-col gap-2">
        <h2 className={cn(woodySection.eyebrow, "px-1")}>Pedidos recebidos</h2>
        <p className="px-3 py-3 text-sm text-[var(--woody-muted)]">A carregar…</p>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className={cn(woodySection.eyebrow, "px-1")}>Pedidos recebidos</h2>
      <ul className="flex flex-col gap-2 p-0 m-0">
        {items.map((c) => {
          const peer = c.otherUser;
          const label = peer.displayName ?? peer.username;
          const preview = c.lastMessagePreview?.trim() || "Quer iniciar uma conversa contigo.";
          const busy = actionBusyId === c.id;

          return (
            <li
              key={c.id}
              className={cn(
                "rounded-2xl border border-[var(--woody-divider)] bg-[var(--woody-bg)]/80 p-3 shadow-[0_1px_2px_rgba(58,45,36,0.04)]",
                selectedId === c.id && "ring-1 ring-[var(--woody-nav)]/25"
              )}
            >
              <button
                type="button"
                onClick={() => onOpen(c.id)}
                className={cn(
                  woodyFocus.ring,
                  "flex w-full min-w-0 items-start gap-3 rounded-xl text-left transition-colors hover:bg-[var(--woody-nav)]/5"
                )}
              >
                <Avatar className="size-11 shrink-0 border border-[var(--woody-accent)]/15">
                  <AvatarImage src={peer.profilePic ?? undefined} alt="" />
                  <AvatarFallback className="bg-amber-500/15 text-sm font-medium text-[var(--woody-text)]">
                    {initials(label)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate font-semibold text-[var(--woody-text)]">{label}</p>
                    <span className="shrink-0 text-[0.7rem] text-[var(--woody-muted)]">
                      {formatConversationListTime(c.lastMessageAt ?? c.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--woody-muted)]">{preview}</p>
                </div>
              </button>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="min-h-9"
                  disabled={busy}
                  onClick={() => void onAccept(c.id)}
                >
                  {busy ? "A processar…" : "Aceitar"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="min-h-9 border-[var(--woody-divider)]"
                  disabled={busy}
                  onClick={() => void onReject(c.id)}
                >
                  Recusar
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
