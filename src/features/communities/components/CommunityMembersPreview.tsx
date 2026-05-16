import { type UIEvent, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { woodyDialogScroll, woodyFocus, woodySurface } from "@/lib/woody-ui";
import type { CommunityMemberListItem } from "@/domain/types";
import { CommunityMemberRoleIndicator } from "@/features/communities/components/CommunityMemberRoleIndicator";
import { fetchCommunityMembersPage } from "../services/community.service";

export interface CommunityMembersPreviewProps {
  communityId: string;
  memberCount: number;
  /** Ordem esperada: criadora, admins, membros (ex.: `getCommunityMemberListItems`). */
  members: CommunityMemberListItem[];
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
  communityId,
  memberCount,
  members,
  maxVisible = 6,
  className,
}: CommunityMembersPreviewProps) {
  const [allMembersOpen, setAllMembersOpen] = useState(false);
  const [modalMembers, setModalMembers] = useState<CommunityMemberListItem[]>([]);
  const [modalPage, setModalPage] = useState(0);
  const [modalHasNext, setModalHasNext] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const visible = members.slice(0, maxVisible);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadMoreMembers = useCallback(async () => {
    if (modalLoading || !modalHasNext) return;
    setModalLoading(true);
    setModalError(null);
    try {
      const nextPage = modalPage + 1;
      const chunk = await fetchCommunityMembersPage(communityId, nextPage, 30);
      setModalMembers((prev) => (nextPage === 1 ? chunk.items : [...prev, ...chunk.items]));
      setModalPage(nextPage);
      setModalHasNext(chunk.hasNextPage);
    } catch {
      setModalError("Não foi possível carregar mais membros.");
    } finally {
      setModalLoading(false);
    }
  }, [communityId, modalHasNext, modalLoading, modalPage]);

  useEffect(() => {
    if (!allMembersOpen) return;
    setModalMembers([]);
    setModalPage(0);
    setModalHasNext(true);
    setModalError(null);
  }, [allMembersOpen, communityId]);

  useEffect(() => {
    if (!allMembersOpen || modalPage > 0) return;
    void loadMoreMembers();
  }, [allMembersOpen, modalPage, loadMoreMembers]);

  const handleModalScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      if (!modalHasNext || modalLoading) return;
      const el = event.currentTarget;
      const threshold = 120;
      if (el.scrollHeight - el.scrollTop - el.clientHeight <= threshold) {
        void loadMoreMembers();
      }
    },
    [loadMoreMembers, modalHasNext, modalLoading]
  );

  return (
    <section className={cn(panel, className)} aria-labelledby="community-members-heading">
      <div className="flex items-center gap-2">
        <Users className="size-4 shrink-0 text-[var(--woody-nav)]" aria-hidden />
        <h2 id="community-members-heading" className="text-sm font-bold text-[var(--woody-text)]">
          Quem participa
        </h2>
      </div>
      <p className="mt-1 text-xs text-[var(--woody-muted)]">Membros desta comunidade.</p>

      {members.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--woody-muted)]">Nenhuma participante listada ainda.</p>
      ) : (
        <ul className="mt-4 space-y-2.5 list-none p-0 m-0">
          {visible.map(({ user, role }) => (
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
                  <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="truncate text-sm font-semibold text-[var(--woody-text)]">{user.name}</p>
                    <CommunityMemberRoleIndicator role={role} variant="participant" />
                  </div>
                  <p className="truncate text-xs text-[var(--woody-muted)]">@{user.username}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {members.length > 0 ? (
        <div className="mt-3 text-center">
          <Button
            type="button"
            variant="link"
            className={cn(
              "h-auto px-0 text-xs font-semibold text-[var(--woody-nav)] hover:text-[var(--woody-nav)]/80",
              woodyFocus.ring
            )}
            onClick={() => setAllMembersOpen(true)}
          >
            Ver todos os membros
          </Button>
        </div>
      ) : null}

      <Dialog open={allMembersOpen} onOpenChange={setAllMembersOpen}>
        <DialogContent className={cn(woodyDialogScroll, "max-w-[min(40rem,calc(100vw-1.5rem))]")}>
          <DialogHeader className="pr-8 text-left">
            <DialogTitle>Membros da comunidade</DialogTitle>
            <DialogDescription>
              {memberCount} {memberCount === 1 ? "participante" : "participantes"} neste espaço.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-1 max-h-[52dvh] overflow-y-auto pr-1" onScroll={handleModalScroll}>
            <ul className="space-y-2 list-none p-0 m-0">
            {modalMembers.map(({ user, role }) => (
              <li key={user.id}>
                <Link
                  to={`/profile/${user.id}`}
                  className="flex min-w-0 items-center gap-3 rounded-xl p-2 transition-colors hover:bg-[var(--woody-nav)]/6 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/30"
                  onClick={() => setAllMembersOpen(false)}
                >
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage src={user.avatarUrl ?? undefined} alt="" />
                    <AvatarFallback className="bg-[var(--woody-nav)]/10 text-xs text-[var(--woody-text)]">
                      {initials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="truncate text-sm font-semibold text-[var(--woody-text)]">{user.name}</p>
                      <CommunityMemberRoleIndicator role={role} variant="participant" />
                    </div>
                    <p className="truncate text-xs text-[var(--woody-muted)]">@{user.username}</p>
                  </div>
                </Link>
              </li>
            ))}
            </ul>
            {modalLoading ? (
              <div className="flex items-center justify-center gap-2 py-3 text-xs text-[var(--woody-muted)]">
                <Loader2 className="size-3.5 animate-spin" />
                Carregando mais membros…
              </div>
            ) : null}
            {modalError ? (
              <p className="py-3 text-center text-xs text-red-600 dark:text-red-400">{modalError}</p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
