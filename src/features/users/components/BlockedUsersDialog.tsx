import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Search, UserX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StoryRing } from "@/components/ui/StoryRing";
import type { User } from "@/domain/types";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { showActionErrorToast, showSuccessToast } from "@/lib/toast/woodyToast";
import {
  dispatchBlockRelationshipChanged,
  dispatchSocialGraphChanged,
} from "@/lib/socialGraphEvents";
import { fetchBlockedUsersPage, unblockUser } from "../services/userBlock.service";

export interface BlockedUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export function BlockedUsersDialog({ open, onOpenChange }: BlockedUsersDialogProps) {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [items, setItems] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingUnblockId, setPendingUnblockId] = useState<string | null>(null);
  const loadSeq = useRef(0);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [open, searchInput]);

  const loadPage = useCallback(
    async (targetPage: number, search: string, append: boolean) => {
      const seq = ++loadSeq.current;
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      try {
        const result = await fetchBlockedUsersPage(targetPage, PAGE_SIZE, search || undefined);
        if (loadSeq.current !== seq) return;
        setItems((prev) => (append ? [...prev, ...result.items] : result.items));
        setPage(result.page);
        setHasNextPage(result.hasNextPage);
      } catch (e) {
        if (loadSeq.current !== seq) return;
        setError(e instanceof Error ? e.message : "Falha ao carregar usuárias bloqueadas.");
        if (!append) setItems([]);
      } finally {
        if (loadSeq.current === seq) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!open) return;
    void loadPage(1, debouncedSearch, false);
  }, [open, debouncedSearch, loadPage]);

  useEffect(() => {
    if (!open) {
      setSearchInput("");
      setDebouncedSearch("");
      setItems([]);
      setPage(1);
      setHasNextPage(false);
      setError(null);
      setPendingUnblockId(null);
    }
  }, [open]);

  const handleUnblock = async (user: User) => {
    if (pendingUnblockId) return;
    setPendingUnblockId(user.id);
    try {
      await unblockUser(user.id);
      showSuccessToast("Usuária desbloqueada.");
      setItems((prev) => prev.filter((u) => u.id !== user.id));
      dispatchBlockRelationshipChanged(user.id);
      dispatchSocialGraphChanged();
    } catch (e) {
      showActionErrorToast(e, "Não foi possível desbloquear esta usuária.");
    } finally {
      setPendingUnblockId(null);
    }
  };

  const emptyMessage =
    debouncedSearch.length > 0
      ? "Nenhum perfil bloqueado encontrado."
      : "Nenhuma usuária bloqueada.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[min(90dvh,720px)] flex-col gap-0 overflow-hidden border-[var(--woody-accent)]/15 p-0 sm:max-w-lg"
        )}
      >
        <DialogHeader className="shrink-0 px-4 pt-5 pb-3 sm:px-6 sm:pt-6">
          <DialogTitle className="text-[var(--woody-text)]">Usuárias bloqueadas</DialogTitle>
          <DialogDescription className="text-pretty pt-1">
            Você pode desbloquear alguém a qualquer momento. A pessoa não será notificada.
          </DialogDescription>
        </DialogHeader>

        <div className="shrink-0 border-y border-[var(--woody-accent)]/10 px-4 py-3 sm:px-6">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--woody-muted)]"
              aria-hidden
            />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nome ou @"
              className={cn(
                "h-11 w-full rounded-xl border border-black/10 bg-white/60 pl-9 pr-3 text-sm",
                "text-[var(--woody-text)] placeholder:text-[var(--woody-muted)]",
                woodyFocus.ring
              )}
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2 sm:px-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-[var(--woody-muted)]">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Carregando…
            </div>
          ) : error ? (
            <div className="px-2 py-8 text-center text-sm text-red-600">{error}</div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
              <UserX className="size-8 text-[var(--woody-muted)]/70" aria-hidden />
              <p className="text-sm text-[var(--woody-muted)]">{emptyMessage}</p>
            </div>
          ) : (
            <ul className="divide-y divide-black/[0.06]">
              {items.map((user) => {
                const busy = pendingUnblockId === user.id;
                return (
                  <li
                    key={user.id}
                    className="flex min-w-0 items-center gap-3 px-2 py-3 sm:px-1"
                  >
                    <StoryRing
                      avatarUrl={user.avatarUrl}
                      displayName={user.name}
                      hasActiveStories={false}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[var(--woody-text)]">
                        {user.name}
                      </p>
                      {user.username ? (
                        <p className="truncate text-xs text-[var(--woody-muted)]">@{user.username}</p>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={cn("shrink-0 min-h-10 touch-manipulation", woodyFocus.ring)}
                      disabled={busy || pendingUnblockId != null}
                      onClick={() => void handleUnblock(user)}
                    >
                      {busy ? (
                        <>
                          <Loader2 className="mr-1.5 size-3.5 animate-spin" aria-hidden />
                          …
                        </>
                      ) : (
                        "Desbloquear"
                      )}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {!loading && !error && hasNextPage ? (
          <div className="shrink-0 border-t border-[var(--woody-accent)]/10 px-4 py-3 sm:px-6">
            <Button
              type="button"
              variant="outline"
              className={cn("w-full min-h-11 touch-manipulation", woodyFocus.ring)}
              disabled={loadingMore}
              onClick={() => void loadPage(page + 1, debouncedSearch, true)}
            >
              {loadingMore ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  Carregando…
                </>
              ) : (
                "Carregar mais"
              )}
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
