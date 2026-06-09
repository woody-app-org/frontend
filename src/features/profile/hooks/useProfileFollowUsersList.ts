import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@/domain/types";
import { fetchUserFollowersPage, fetchUserFollowingPage } from "../services/follow.service";

const PAGE_SIZE = 30;

export type ProfileFollowListKind = "followers" | "following";

export interface UseProfileFollowUsersListParams {
  profileUserId: string;
  kind: ProfileFollowListKind | null;
  refreshEpoch: number;
  /** Termo já debounced; vazio omite o query param `search`. */
  search?: string;
}

export function useProfileFollowUsersList({
  profileUserId,
  kind,
  refreshEpoch,
  search = "",
}: UseProfileFollowUsersListParams) {
  const [items, setItems] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastReq = useRef(0);

  const effectiveSearch = search.trim();

  useEffect(() => {
    if (!kind || !profileUserId) {
      setItems([]);
      setPage(1);
      setHasNextPage(false);
      setError(null);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    const reqId = ++lastReq.current;
    const fetcher = kind === "followers" ? fetchUserFollowersPage : fetchUserFollowingPage;

    setItems([]);
    setLoading(true);
    setError(null);

    let cancelled = false;

    (async () => {
      try {
        const r = await fetcher(
          profileUserId,
          1,
          PAGE_SIZE,
          effectiveSearch || undefined
        );
        if (cancelled || lastReq.current !== reqId) return;
        setItems(r.items);
        setPage(1);
        setHasNextPage(r.hasNextPage);
      } catch (e) {
        if (cancelled || lastReq.current !== reqId) return;
        setError(e instanceof Error ? e.message : "Falha ao carregar.");
        setItems([]);
      } finally {
        if (!cancelled && lastReq.current === reqId) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profileUserId, kind, refreshEpoch, effectiveSearch]);

  const loadMore = useCallback(async () => {
    if (!kind || !profileUserId || !hasNextPage || loading || loadingMore) return;
    const fetcher = kind === "followers" ? fetchUserFollowersPage : fetchUserFollowingPage;
    const reqId = ++lastReq.current;
    setLoadingMore(true);
    setError(null);
    try {
      const nextPage = page + 1;
      const r = await fetcher(
        profileUserId,
        nextPage,
        PAGE_SIZE,
        effectiveSearch || undefined
      );
      if (lastReq.current !== reqId) return;
      setHasNextPage(r.hasNextPage);
      setPage(nextPage);
      setItems((prev) => {
        const seen = new Set(prev.map((u) => u.id));
        const out = [...prev];
        for (const u of r.items) {
          if (!seen.has(u.id)) {
            seen.add(u.id);
            out.push(u);
          }
        }
        return out;
      });
    } catch (e) {
      if (lastReq.current !== reqId) return;
      setError(e instanceof Error ? e.message : "Falha ao carregar mais.");
    } finally {
      if (lastReq.current === reqId) setLoadingMore(false);
    }
  }, [
    kind,
    profileUserId,
    hasNextPage,
    loading,
    loadingMore,
    page,
    effectiveSearch,
  ]);

  const retry = useCallback(async () => {
    if (!kind || !profileUserId) return;
    const fetcher = kind === "followers" ? fetchUserFollowersPage : fetchUserFollowingPage;
    const reqId = ++lastReq.current;
    setLoading(true);
    setError(null);
    try {
      const r = await fetcher(
        profileUserId,
        1,
        PAGE_SIZE,
        effectiveSearch || undefined
      );
      if (lastReq.current !== reqId) return;
      setItems(r.items);
      setPage(1);
      setHasNextPage(r.hasNextPage);
    } catch (e) {
      if (lastReq.current !== reqId) return;
      setError(e instanceof Error ? e.message : "Falha ao carregar.");
      setItems([]);
    } finally {
      if (lastReq.current === reqId) setLoading(false);
    }
  }, [kind, profileUserId, effectiveSearch]);

  return {
    items,
    loading,
    loadingMore,
    error,
    hasNextPage,
    loadMore,
    retry,
  };
}
