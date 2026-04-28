import { Archive, Loader2, MessageCircle, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus, woodySurface } from "@/lib/woody-ui";
import type { ProfileSignal } from "../services/profile-signals.service";

export interface ProfileSignalReceivedCardProps {
  signal: ProfileSignal;
  busy: boolean;
  onViewProfile: (signal: ProfileSignal) => void;
  onReply: (signal: ProfileSignal) => void;
  onArchive: (signal: ProfileSignal) => void;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatSignalDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("pt-PT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProfileSignalReceivedCard({
  signal,
  busy,
  onViewProfile,
  onReply,
  onArchive,
}: ProfileSignalReceivedCardProps) {
  const unread = signal.status === "sent";

  return (
    <article
      className={cn(
        woodySurface.card,
        "p-4 transition-[border-color,box-shadow] sm:p-5",
        unread && "border-[var(--woody-nav)]/35 shadow-[0_8px_28px_rgba(139,195,74,0.12)]"
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <Avatar className="size-12">
            <AvatarImage src={signal.sender.avatarUrl ?? undefined} alt={signal.sender.name} />
            <AvatarFallback className="bg-[var(--woody-nav)]/10 font-semibold text-[var(--woody-text)]">
              {initials(signal.sender.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-[var(--woody-text)]">{signal.sender.name}</h3>
              <span className="rounded-full bg-[var(--woody-tag-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--woody-tag-text)]">
                {signal.label} {signal.emoji}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide",
                  unread
                    ? "bg-[var(--woody-nav)] text-white"
                    : "bg-[var(--woody-bg)] text-[var(--woody-muted)]"
                )}
              >
                {unread ? "Novo" : "Lido"}
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--woody-muted)]">
              {signal.sender.username ? `@${signal.sender.username} · ` : ""}
              {formatSignalDate(signal.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            className={cn(woodyFocus.ring, "touch-manipulation rounded-lg")}
            onClick={() => onViewProfile(signal)}
          >
            <UserRound className="size-4" aria-hidden />
            Ver perfil
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            title="Abrir conversa com a remetente (respeita pedidos de DM se aplicável)"
            className={cn(woodyFocus.ring, "touch-manipulation rounded-lg")}
            onClick={() => onReply(signal)}
          >
            <MessageCircle className="size-4" aria-hidden />
            Responder
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            className={cn(
              woodyFocus.ring,
              "touch-manipulation rounded-lg text-[var(--woody-muted)] hover:text-[var(--woody-text)]"
            )}
            onClick={() => onArchive(signal)}
          >
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Archive className="size-4" aria-hidden />}
            Arquivar
          </Button>
        </div>
      </div>
    </article>
  );
}
