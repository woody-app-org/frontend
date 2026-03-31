import { useState, useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { subscribeCommunityDrafts, getCommunityDraftsVersion } from "@/domain/mocks/communityDraftStore";
import {
  getPostInteractionsVersion,
  subscribePostInteractions,
} from "@/domain/mocks/postInteractionMockStore";
import { subscribeUserDisplayPatches, getUserDisplayPatchesVersion } from "@/domain/mocks/userDisplayPatchStore";
import { useViewerId } from "@/features/auth/hooks/useViewerId";
import type { Post, FeedFilter } from "../types";
import { getFeed } from "../services/feed.service";

interface UseFeedReturn {
  posts: Post[];
  isLoading: boolean;
  isRefreshing: boolean;
  hasLoadedOnce: boolean;
  error: Error | null;
  page: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  filter: FeedFilter;
  setFilter: (filter: FeedFilter) => void;
  nextPage: () => void;
  previousPage: () => void;
  refetch: () => void;
}

export function useFeed(): UseFeedReturn {
  const viewerId = useViewerId();
  const userDisplayRev = useSyncExternalStore(
    subscribeUserDisplayPatches,
    getUserDisplayPatchesVersion,
    getUserDisplayPatchesVersion
  );
  const communityDraftRev = useSyncExternalStore(
    subscribeCommunityDrafts,
    getCommunityDraftsVersion,
    getCommunityDraftsVersion
  );
  const postInteractionRev = useSyncExternalStore(
    subscribePostInteractions,
    getPostInteractionsVersion,
    getPostInteractionsVersion
  );
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilterState] = useState<FeedFilter>("trending");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const isFirstLoadRef = useRef(true);

  const fetchFeed = useCallback(async () => {
    void userDisplayRev;
    void communityDraftRev;
    void postInteractionRev;
    const isInitialLoad = isFirstLoadRef.current;
    setIsLoading(isInitialLoad);
    setIsRefreshing(!isInitialLoad);
    setError(null);
    try {
      const response = await getFeed(page, filter, viewerId);
      setPosts(response.items);
      setHasNextPage(response.hasNextPage);
      setHasPreviousPage(response.hasPreviousPage);
      setHasLoadedOnce(true);
      isFirstLoadRef.current = false;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Falha ao carregar feed"));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [page, filter, viewerId, userDisplayRev, communityDraftRev, postInteractionRev]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const setFilter = useCallback((newFilter: FeedFilter) => {
    setFilterState(newFilter);
    setPage(1);
  }, []);

  const nextPage = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  const previousPage = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, []);

  const refetch = useCallback(() => {
    fetchFeed();
  }, [fetchFeed]);

  return {
    posts,
    isLoading,
    isRefreshing,
    hasLoadedOnce,
    error,
    page,
    hasNextPage,
    hasPreviousPage,
    filter,
    setFilter,
    nextPage,
    previousPage,
    refetch,
  };
}
