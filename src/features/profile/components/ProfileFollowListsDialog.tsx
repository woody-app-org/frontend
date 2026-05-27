import { useState } from "react";
import { Loader2, Search, Users, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyDialogScroll, woodyFocus } from "@/lib/woody-ui";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { ProfileFollowListKind } from "../hooks/useProfileFollowUsersList";
import { useProfileFollowUsersList } from "../hooks/useProfileFollowUsersList";
import { FollowListUserRow } from "./FollowListUserRow";

const SEARCH_DEBOUNCE_MS = 300;

interface ProfileFollowListsDialogBodyProps {
  profileUserId: string;
  kind: ProfileFollowListKind;
  refreshEpoch: number;
  onOpenChange: (open: boolean) => void;
}

function ProfileFollowListsDialogBody({
  profileUserId,
  kind,
  refreshEpoch,
  onOpenChange,
}: ProfileFollowListsDialogBodyProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebouncedValue(searchTerm, SEARCH_DEBOUNCE_MS);

  const { items, loading, loadingMore, error, hasNextPage, loadMore, retry } =
    useProfileFollowUsersList({
      profileUserId,
      kind,
      refreshEpoch,
      search: debouncedSearchTerm,
    });

  const trimmedSearch = debouncedSearchTerm.trim();
  const hasActiveSearch = trimmedSearch.length > 0;
  const isSearchPending = searchTerm.trim() !== trimmedSearch;

  const showInitialLoading = (loading && items.length === 0) || isSearchPending;
  const showFullError = Boolean(error && !loading && !isSearchPending && items.length === 0);
  const showInlineError = Boolean(error && items.length > 0);
  const showEmptyNoSearch = !showInitialLoading && !error && items.length === 0 && !hasActiveSearch;
  const showEmptySearch = !showInitialLoading && !error && items.length === 0 && hasActiveSearch;
  const showList = items.length > 0 && !showInitialLoading;
  const showInputLoading = loading || isSearchPending;

  return (
    <>
      <DialogHeader className="shrink-0 border-b border-[var(--woody-accent)]/12 p-4 sm:p-5">
        <div className="flex items-center gap-2 sm:gap-3">
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
          <DialogTitle className="shrink-0 text-base sm:text-lg">
            {kind === "followers" ? "Seguidores" : "Seguindo"}
          </DialogTitle>
          <form
            className="relative min-w-0 flex-1"
            onSubmit={(e) => e.preventDefault()}
          >
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--woody-muted)]"
              aria-hidden
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou @"
              aria-label="Buscar perfis"
              enterKeyHint="search"
              autoComplete="off"
              className={cn(
                woodyFocus.ring,
                "h-10 w-full min-w-0 rounded-xl border border-[var(--woody-accent)]/15 bg-[var(--woody-bg)]/80 pl-10 text-sm text-[var(--woody-text)] placeholder:text-[var(--woody-muted)]",
                searchTerm && showInputLoading
                  ? "pr-[4.5rem]"
                  : searchTerm || showInputLoading
                    ? "pr-10"
                    : "pr-3",
                "focus:outline-none focus-visible:ring-2"
              )}
            />
            {showInputLoading ? (
              <Loader2
                className={cn(
                  "absolute top-1/2 size-4 -translate-y-1/2 animate-spin text-[var(--woody-muted)]",
                  searchTerm ? "right-10" : "right-3"
                )}
                aria-hidden
              />
            ) : null}
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className={cn(
                  woodyFocus.ring,
                  "absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 touch-manipulation items-center justify-center rounded-lg text-[var(--woody-muted)] transition-colors hover:bg-[var(--woody-nav)]/10 hover:text-[var(--woody-text)]"
                )}
                aria-label="Limpar busca"
              >
                <X className="size-4" aria-hidden />
              </button>
            ) : null}
          </form>
        </div>
      </DialogHeader>

      <div className={cn(woodyDialogScroll, "min-h-0 flex-1 px-3 py-2 sm:px-4 sm:py-3")}>
        {showInitialLoading ? (
          <div
            className="flex flex-col items-center justify-center gap-3 py-16 text-[var(--woody-muted)]"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="size-8 animate-spin text-[var(--woody-nav)]" aria-hidden />
            <p className="text-sm">A carregar…</p>
          </div>
        ) : null}

        {showFullError ? (
          <div className="flex flex-col items-center gap-3 px-1 py-10 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="touch-manipulation min-h-10"
              onClick={() => void retry()}
            >
              Tentar outra vez
            </Button>
          </div>
        ) : null}

        {showInlineError ? (
          <div
            className="mb-3 rounded-xl border border-red-500/25 bg-red-500/[0.06] px-3 py-2.5 text-center sm:px-4"
            role="alert"
          >
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 touch-manipulation min-h-9"
              onClick={() => void loadMore()}
            >
              Tentar carregar mais
            </Button>
          </div>
        ) : null}

        {showEmptyNoSearch ? (
          <div className="flex flex-col items-center justify-center gap-2 px-2 py-14 text-center text-[var(--woody-muted)]">
            <Users className="size-10 opacity-40" aria-hidden />
            <p className="text-sm font-medium text-[var(--woody-text)]/80">
              {kind === "followers"
                ? "Ainda não há seguidores por aqui."
                : "Ainda não segue ninguém."}
            </p>
            <p className="max-w-xs text-xs leading-relaxed text-[var(--woody-muted)]">
              {kind === "followers"
                ? "Quando alguém seguir este perfil, aparece nesta lista."
                : "Quando seguir contas, elas surgem aqui."}
            </p>
          </div>
        ) : null}

        {showEmptySearch ? (
          <div className="flex flex-col items-center justify-center gap-2 px-2 py-14 text-center text-[var(--woody-muted)]">
            <Search className="size-10 opacity-40" aria-hidden />
            <p className="text-sm font-medium text-[var(--woody-text)]/80">
              Nenhum perfil encontrado.
            </p>
          </div>
        ) : null}

        {showList ? (
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

        {hasNextPage && !showFullError && !showInitialLoading ? (
          <div className="mt-3 flex justify-center pb-2 sm:mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 w-full max-w-xs touch-manipulation sm:min-h-10 sm:w-auto"
              disabled={loadingMore}
              onClick={() => void loadMore()}
            >
              {loadingMore ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  A carregar…
                </span>
              ) : (
                "Carregar mais"
              )}
            </Button>
          </div>
        ) : null}
      </div>
    </>
  );
}

export interface ProfileFollowListsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileUserId: string;
  kind: ProfileFollowListKind;
  /** Incrementar após mutações de follow para refrescar listas abertas. */
  refreshEpoch: number;
}

export function ProfileFollowListsDialog({
  open,
  onOpenChange,
  profileUserId,
  kind,
  refreshEpoch,
}: ProfileFollowListsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[min(92dvh,820px)] w-[calc(100vw-1rem)] max-w-xl flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
        )}
      >
        {open ? (
          <ProfileFollowListsDialogBody
            key={kind}
            profileUserId={profileUserId}
            kind={kind}
            refreshEpoch={refreshEpoch}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
