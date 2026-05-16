import { useCallback, useEffect, useState } from "react";
import type { User } from "@/domain/types";
import { fetchUserFollowersPage, fetchUserFollowingPage } from "../services/follow.service";

const PAGE_SIZE = 30;

export type ProfileFollowListKind = "followers" | "following";

export function useProfileFollowUsersList(
  profileUserId: string,
  kind: ProfileFollowListKind | null,
  refreshEpoch: number
) {
  const [items, setItems] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    let cancelled = false;
    const fetcher = kind === "followers" ? fetchUserFollowersPage : fetchUserFollowingPage;

    setItems([]);

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await fetcher(profileUserId, 1, PAGE_SIZE);
        if (cancelled) return;
        setItems(r.items);
        setPage(1);
        setHasNextPage(r.hasNextPage);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Falha ao carregar.");
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profileUserId, kind, refreshEpoch]);

  const loadMore = useCallback(async () => {
    if (!kind || !profileUserId || !hasNextPage || loading || loadingMore) return;
    const fetcher = kind === "followers" ? fetchUserFollowersPage : fetchUserFollowingPage;
    setLoadingMore(true);
    setError(null);
    try {
      const nextPage = page + 1;
      const r = await fetcher(profileUserId, nextPage, PAGE_SIZE);
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
      setError(e instanceof Error ? e.message : "Falha ao carregar mais.");
    } finally {
      setLoadingMore(false);
    }
  }, [kind, profileUserId, hasNextPage, loading, loadingMore, page]);

  const retry = useCallback(async () => {
    if (!kind || !profileUserId) return;
    const fetcher = kind === "followers" ? fetchUserFollowersPage : fetchUserFollowingPage;
    setLoading(true);
    setError(null);
    try {
      const r = await fetcher(profileUserId, 1, PAGE_SIZE);
      setItems(r.items);
      setPage(1);
      setHasNextPage(r.hasNextPage);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao carregar.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [kind, profileUserId]);

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
