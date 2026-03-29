import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import type { JoinRequest, User } from "@/domain/types";
import type { CommunityMembershipActionResult } from "../../services/communityMembership.service";
import { approveJoinRequest, rejectJoinRequest } from "../../services/communityMembership.service";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export interface PendingRequestRowProps {
  request: JoinRequest;
  user: User;
  viewerId: string;
  onChanged: () => void;
}

export function PendingRequestRow({ request, user, viewerId, onChanged }: PendingRequestRowProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (fn: () => Promise<CommunityMembershipActionResult>) => {
    setBusy(true);
    setError(null);
    try {
      const r = await fn();
      if (!r.ok) setError(r.error);
      else onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 sm:p-3.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to={`/profile/${user.id}`}
          className={cn(
            "flex min-w-0 items-center gap-3 rounded-lg transition-colors hover:bg-[var(--woody-nav)]/6",
            woodyFocus.ring
          )}
        >
          <Avatar className="size-10 shrink-0">
            <AvatarImage src={user.avatarUrl ?? undefined} alt="" />
            <AvatarFallback className="bg-[var(--woody-nav)]/10 text-xs text-[var(--woody-text)]">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-semibold text-[var(--woody-text)]">{user.name}</p>
            <p className="truncate text-xs text-[var(--woody-muted)]">@{user.username}</p>
            <span className="mt-1 inline-flex rounded-md bg-amber-500/15 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-amber-900 dark:text-amber-100">
              Pendente
            </span>
          </div>
        </Link>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={busy}
            className="rounded-lg bg-[var(--woody-nav)] text-xs text-white hover:bg-[var(--woody-nav)]/90"
            onClick={() => run(() => approveJoinRequest(viewerId, request.id))}
          >
            Aprovar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            className="rounded-lg border-red-500/35 text-xs text-red-700 hover:bg-red-500/10 dark:text-red-300"
            onClick={() => {
              if (!window.confirm(`Recusar o pedido de ${user.name}?`)) return;
              void run(() => rejectJoinRequest(viewerId, request.id));
            }}
          >
            Recusar
          </Button>
        </div>
      </div>
      {error ? <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{error}</p> : null}
    </li>
  );
}
