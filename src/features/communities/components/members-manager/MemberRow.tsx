import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import {
  getCommunityMemberRoleManagementBadgeClass,
  getCommunityMemberRoleManagementLabel,
} from "@/domain/communityMemberRole";
import type { Community, Membership, User } from "@/domain/types";
import {
  type CommunityMembershipActionResult,
  banMember,
  removeMember,
  setCommunityMemberRole,
} from "../../services/communityMembership.service";
import { ProBadge } from "@/features/subscription/components/ProBadge";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export interface MemberRowProps {
  community: Community;
  membership: Membership;
  user: User;
  viewerId: string;
  actorIsOwner: boolean;
  onChanged: () => void;
}

export function MemberRow({ community, membership, user, viewerId, actorIsOwner, onChanged }: MemberRowProps) {
  const isTargetOwner = community.ownerUserId === user.id || membership.role === "owner";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDestructive, setConfirmDestructive] = useState<null | "remove" | "ban">(null);

  const run = async (fn: () => Promise<CommunityMembershipActionResult>) => {
    setBusy(true);
    setError(null);
    try {
      const r = await fn();
      if (!r.ok) setError(r.error ?? "Erro.");
      else onChanged();
    } finally {
      setBusy(false);
    }
  };

  const canModerate = !isTargetOwner && !busy && !confirmDestructive;
  const showPromote = actorIsOwner && membership.role === "member" && canModerate;
  const showDemote = actorIsOwner && membership.role === "admin" && canModerate;

  return (
    <li className="rounded-xl border border-[var(--woody-accent)]/12 bg-[var(--woody-bg)]/60 p-3 sm:p-3.5">
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
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <p className="truncate text-sm font-semibold text-[var(--woody-text)]">{user.name}</p>
              {user.showProBadge ? <ProBadge variant="inline" /> : null}
            </div>
            <p className="truncate text-xs text-[var(--woody-muted)]">@{user.username}</p>
            <span
              className={cn(
                "mt-1 inline-flex rounded-md px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide",
                getCommunityMemberRoleManagementBadgeClass(membership.role, isTargetOwner)
              )}
            >
              {getCommunityMemberRoleManagementLabel(membership.role, isTargetOwner)}
            </span>
          </div>
        </Link>

        {isTargetOwner ? (
          <p className="text-xs text-[var(--woody-muted)] sm:text-right">Papel fixo no mock.</p>
        ) : confirmDestructive ? (
          <div
            className="w-full max-w-full rounded-xl border border-[var(--woody-accent)]/18 bg-[var(--woody-nav)]/6 p-3 sm:max-w-sm"
            role="region"
            aria-label="Confirmar ação administrativa"
          >
            <p className="text-sm font-medium text-[var(--woody-text)]">
              {confirmDestructive === "remove"
                ? `Remover ${user.name} desta comunidade?`
                : `Restringir ${user.name} neste espaço?`}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--woody-muted)]">
              {confirmDestructive === "remove"
                ? "A pessoa perde o acesso imediatamente."
                : "No mock, nova entrada exigiria ajuste manual nos dados."}
            </p>
            <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busy}
                className="min-h-10 w-full rounded-lg text-xs sm:w-auto"
                onClick={() => setConfirmDestructive(null)}
              >
                Voltar
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={busy}
                className={cn(
                  "min-h-10 w-full rounded-lg text-xs sm:w-auto",
                  confirmDestructive === "remove"
                    ? "border-red-500/35 bg-red-500/10 text-red-800 hover:bg-red-500/15 dark:text-red-200"
                    : "border-red-500/30 text-red-800 hover:bg-red-500/10 dark:text-red-200"
                )}
                variant="outline"
                onClick={() => {
                  const kind = confirmDestructive;
                  if (!kind) return;
                  void run(async () => {
                    const r =
                      kind === "remove"
                        ? await removeMember(viewerId, community.id, user.id)
                        : await banMember(viewerId, community.id, user.id);
                    if (r.ok) setConfirmDestructive(null);
                    return r;
                  });
                }}
              >
                {busy ? "Processando…" : "Confirmar"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2" aria-busy={busy}>
            {showPromote ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busy}
                className="min-h-10 rounded-lg text-xs"
                onClick={() =>
                  run(() => setCommunityMemberRole(viewerId, community.id, user.id, "admin"))
                }
              >
                Promover a admin
              </Button>
            ) : null}
            {showDemote ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busy}
                className="min-h-10 rounded-lg text-xs"
                onClick={() =>
                  run(() => setCommunityMemberRole(viewerId, community.id, user.id, "member"))
                }
              >
                Rebaixar para membro
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!canModerate}
              className="min-h-10 rounded-lg border-red-500/30 text-xs text-red-700 hover:bg-red-500/10 dark:text-red-300"
              onClick={() => setConfirmDestructive("remove")}
            >
              Remover da comunidade
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={!canModerate}
              className="min-h-10 rounded-lg text-xs text-[var(--woody-muted)] hover:text-red-600"
              onClick={() => setConfirmDestructive("ban")}
            >
              Restringir acesso
            </Button>
          </div>
        )}
      </div>
      {error ? <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{error}</p> : null}
    </li>
  );
}
