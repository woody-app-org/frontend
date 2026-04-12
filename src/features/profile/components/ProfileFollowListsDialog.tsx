import { Loader2, Users, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyDialogScroll, woodyFocus } from "@/lib/woody-ui";
import type { ProfileFollowListKind } from "../hooks/useProfileFollowUsersList";
import { useProfileFollowUsersList } from "../hooks/useProfileFollowUsersList";
import { FollowListUserRow } from "./FollowListUserRow";

export interface ProfileFollowListsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileUserId: string;
  profileName: string;
  /** Separador ativo quando o diálogo está aberto. */
  kind: ProfileFollowListKind;
  onKindChange: (kind: ProfileFollowListKind) => void;
  followersCount: number;
  followingCount: number;
  /** Incrementar após mutações de follow para refrescar listas abertas. */
  refreshEpoch: number;
}

function tabClass(active: boolean) {
  return cn(
    woodyFocus.ring,
    "min-w-0 flex-1 rounded-lg px-2 py-2 text-center text-sm font-medium transition-colors sm:px-3",
    active
      ? "bg-[var(--woody-nav)] text-white shadow-sm"
      : "text-[var(--woody-text)]/80 hover:bg-[var(--woody-nav)]/10"
  );
}

export function ProfileFollowListsDialog({
  open,
  onOpenChange,
  profileUserId,
  profileName,
  kind,
  onKindChange,
  followersCount,
  followingCount,
  refreshEpoch,
}: ProfileFollowListsDialogProps) {
  const activeKind = open ? kind : null;
  const { items, loading, loadingMore, error, hasNextPage, loadMore, retry } =
    useProfileFollowUsersList(profileUserId, activeKind, refreshEpoch);

  const shortName = profileName.split(/\s+/)[0] || profileName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[min(92dvh,820px)] w-[calc(100vw-1rem)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
        )}
      >
        <DialogHeader className="shrink-0 space-y-3 border-b border-[var(--woody-accent)]/12 p-4 pb-3 sm:p-5 sm:pb-4">
          <div className="flex items-start justify-between gap-2 pr-8">
            <div className="min-w-0">
              <DialogTitle className="text-left text-base sm:text-lg">
                {kind === "followers" ? "Seguidores" : "A seguir"}
              </DialogTitle>
              <DialogDescription className="mt-1 text-left">
                {kind === "followers"
                  ? `Pessoas que seguem ${shortName}.`
                  : `Contas que ${shortName} segue.`}
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn("size-9 shrink-0 rounded-full", woodyFocus.ring)}
                aria-label="Fechar"
              >
                <X className="size-5" />
              </Button>
            </DialogClose>
          </div>
          <div
            className="flex gap-1 rounded-xl border border-[var(--woody-accent)]/14 bg-[var(--woody-bg)] p-1"
            role="tablist"
            aria-label="Tipo de lista"
          >
            <button
              type="button"
              role="tab"
              aria-selected={kind === "followers"}
              className={tabClass(kind === "followers")}
              onClick={() => onKindChange("followers")}
            >
              Seguidores ({followersCount.toLocaleString("pt-PT")})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={kind === "following"}
              className={tabClass(kind === "following")}
              onClick={() => onKindChange("following")}
            >
              A seguir ({followingCount.toLocaleString("pt-PT")})
            </button>
          </div>
        </DialogHeader>

        <div className={cn(woodyDialogScroll, "min-h-0 flex-1 px-3 py-2 sm:px-4 sm:py-3")}>
          {loading && items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-[var(--woody-muted)]">
              <Loader2 className="size-8 animate-spin text-[var(--woody-nav)]" aria-hidden />
              <p className="text-sm">A carregar…</p>
            </div>
          ) : null}

          {error && !loading ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <Button type="button" variant="outline" size="sm" onClick={() => void retry()}>
                Tentar outra vez
              </Button>
            </div>
          ) : null}

          {!loading && !error && items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-14 text-center text-[var(--woody-muted)]">
              <Users className="size-10 opacity-40" aria-hidden />
              <p className="text-sm">
                {kind === "followers"
                  ? "Ainda não há seguidores por aqui."
                  : "Ainda não segue ninguém."}
              </p>
            </div>
          ) : null}

          {!error && items.length > 0 ? (
            <ul className="m-0 space-y-0.5 p-0">
              {items.map((u) => (
                <FollowListUserRow
                  key={u.id}
                  user={u}
                  onNavigate={() => onOpenChange(false)}
                />
              ))}
            </ul>
          ) : null}

          {hasNextPage && !error ? (
            <div className="mt-3 flex justify-center pb-2 sm:mt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-10 w-full max-w-xs sm:w-auto"
                disabled={loadingMore}
                onClick={() => void loadMore()}
              >
                {loadingMore ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    A carregar…
                  </span>
                ) : (
                  "Carregar mais"
                )}
              </Button>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
