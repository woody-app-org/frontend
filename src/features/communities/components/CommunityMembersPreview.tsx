import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { woodySurface } from "@/lib/woody-ui";
import type { User } from "@/domain/types";

export interface CommunityMembersPreviewProps {
  members: User[];
  /** Limite de avatares visíveis antes do resumo "+N". */
  maxVisible?: number;
  className?: string;
}

const panel = cn(woodySurface.card, "p-4 sm:p-5");

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function CommunityMembersPreview({
  members,
  maxVisible = 6,
  className,
}: CommunityMembersPreviewProps) {
  const visible = members.slice(0, maxVisible);
  const rest = Math.max(0, members.length - visible.length);

  return (
    <section className={cn(panel, className)} aria-labelledby="community-members-heading">
      <div className="flex items-center gap-2">
        <Users className="size-4 shrink-0 text-[var(--woody-nav)]" aria-hidden />
        <h2 id="community-members-heading" className="text-sm font-bold text-[var(--woody-text)]">
          Quem participa
        </h2>
      </div>
      <p className="mt-1 text-xs text-[var(--woody-muted)]">
        Participantes mockados — futuramente esta lista virá da API.
      </p>

      {members.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--woody-muted)]">Nenhuma participante listada ainda.</p>
      ) : (
        <ul className="mt-4 space-y-2.5 list-none p-0 m-0">
          {visible.map((user) => (
            <li key={user.id}>
              <Link
                to={`/profile/${user.id}`}
                className="flex min-w-0 items-center gap-3 rounded-xl p-1.5 -m-1.5 transition-colors hover:bg-[var(--woody-nav)]/6 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/30"
              >
                <Avatar className="size-9 shrink-0">
                  <AvatarImage src={user.avatarUrl ?? undefined} alt="" />
                  <AvatarFallback className="bg-[var(--woody-nav)]/10 text-xs text-[var(--woody-text)]">
                    {initials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--woody-text)]">{user.name}</p>
                  <p className="truncate text-xs text-[var(--woody-muted)]">@{user.username}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {rest > 0 ? (
        <p className="mt-3 text-center text-xs font-medium text-[var(--woody-muted)]">
          +{rest} {rest === 1 ? "membro" : "membros"}
        </p>
      ) : null}
    </section>
  );
}
