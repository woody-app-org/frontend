import { useMemo, useState } from "react";
import { Shield, UserPlus, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { woodyContext, woodyDialogScroll, woodyFocus } from "@/lib/woody-ui";
import { sortActiveMembershipsByHierarchy } from "@/domain/communityMemberRole";
import type { Community, Membership, User } from "@/domain/types";
import {
  getPendingJoinRequestsForCommunity,
  getUserById,
  getMembershipsInCommunity,
} from "@/domain/selectors";
import { MemberRow } from "./MemberRow";
import { PendingRequestRow } from "./PendingRequestRow";

export interface CommunityMembersManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  community: Community;
  viewerId: string;
  actorIsOwner: boolean;
  listRevision: number;
  onListChanged: () => void;
}

export function CommunityMembersManagerDialog({
  open,
  onOpenChange,
  community,
  viewerId,
  actorIsOwner,
  listRevision,
  onListChanged,
}: CommunityMembersManagerDialogProps) {
  const [tab, setTab] = useState<"members" | "requests">("members");

  const { activeMembers, pendingRequests, requestUsers, memberRows } = useMemo(() => {
    void listRevision;
    const all = getMembershipsInCommunity(community.id);
    const activeMembers = all.filter((m) => m.status === "active");
    const sorted = sortActiveMembershipsByHierarchy(activeMembers, community);
    const memberPairs: { membership: Membership; user: User }[] = [];
    for (const m of sorted) {
      const u = getUserById(m.userId);
      if (u) memberPairs.push({ membership: m, user: u });
    }
    const pending = getPendingJoinRequestsForCommunity(community.id);
    const reqUsers: { request: (typeof pending)[0]; user: User }[] = [];
    for (const r of pending) {
      const u = getUserById(r.userId);
      if (u) reqUsers.push({ request: r, user: u });
    }
    return {
      activeMembers: sorted,
      pendingRequests: pending,
      requestUsers: reqUsers,
      memberRows: memberPairs,
    };
  }, [community, listRevision]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          woodyDialogScroll,
          "top-[4%] translate-y-0 sm:top-1/2 sm:-translate-y-1/2",
          "max-w-[min(100vw-1rem,40rem)] border-[var(--woody-accent)]/15 sm:max-w-2xl"
        )}
      >
        <DialogHeader className="space-y-2 pr-6 text-left">
          <div className={cn(woodyContext.adminBadge)}>
            <Shield className="size-3.5 shrink-0" aria-hidden />
            Administrativo · membros
          </div>
          <DialogTitle className="flex flex-wrap items-center gap-2 text-[var(--woody-text)]">
            <Users className="size-5 shrink-0 text-[var(--woody-nav)]" aria-hidden />
            Moderar membros
          </DialogTitle>
          <DialogDescription>
            Aprovar pedidos, remover ou restringir contas neste espaço. Ações mock em communityMembership.service — rotas
            sugeridas em lib/backendIntegrationHints (membership).
          </DialogDescription>
        </DialogHeader>

        <div
          className="mt-2 flex gap-1 rounded-xl border border-[var(--woody-accent)]/12 bg-[var(--woody-bg)] p-1"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "members"}
            className={cn(
              woodyFocus.ring,
              "min-h-11 flex-1 rounded-lg px-2 py-2.5 text-sm font-medium transition-colors",
              tab === "members"
                ? "bg-[var(--woody-nav)] text-white shadow-sm"
                : "text-[var(--woody-text)]/85 hover:bg-[var(--woody-nav)]/8"
            )}
            onClick={() => setTab("members")}
          >
            Membros ({activeMembers.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "requests"}
            className={cn(
              woodyFocus.ring,
              "flex min-h-11 flex-1 items-center justify-center gap-1 rounded-lg px-2 py-2.5 text-sm font-medium transition-colors",
              tab === "requests"
                ? "bg-[var(--woody-nav)] text-white shadow-sm"
                : "text-[var(--woody-text)]/85 hover:bg-[var(--woody-nav)]/8"
            )}
            onClick={() => setTab("requests")}
          >
            <UserPlus className="size-4" aria-hidden />
            Pedidos ({pendingRequests.length})
          </button>
        </div>

        {tab === "members" ? (
          <div className="mt-4">
            {memberRows.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--woody-accent)]/20 bg-[var(--woody-nav)]/5 px-4 py-8 text-center text-sm text-[var(--woody-muted)]">
                Nenhum membro ativo listado.
              </p>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {memberRows.map(({ membership, user }) => (
                  <MemberRow
                    key={membership.id}
                    community={community}
                    membership={membership}
                    user={user}
                    viewerId={viewerId}
                    actorIsOwner={actorIsOwner}
                    onChanged={onListChanged}
                  />
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="mt-4">
            {community.visibility === "public" ? (
              <p className="mb-4 rounded-lg border border-[var(--woody-accent)]/12 bg-[var(--woody-nav)]/5 px-3 py-2 text-xs text-[var(--woody-muted)] leading-relaxed">
                Comunidade pública: entradas diretas são o fluxo principal. A fila abaixo só aparece se houver pedidos
                registrados (ex.: fluxo misto).
              </p>
            ) : null}
            {requestUsers.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--woody-accent)]/20 bg-[var(--woody-nav)]/5 px-4 py-8 text-center text-sm text-[var(--woody-muted)]">
                Nenhum pedido pendente. Quando alguém solicitar entrada numa comunidade privada, aparecerá aqui.
              </p>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {requestUsers.map(({ request, user }) => (
                  <PendingRequestRow
                    key={request.id}
                    request={request}
                    user={user}
                    viewerId={viewerId}
                    onChanged={onListChanged}
                  />
                ))}
              </ul>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
