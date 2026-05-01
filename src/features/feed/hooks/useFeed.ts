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
import { SOCIAL_GRAPH_CHANGED_EVENT } from "@/lib/socialGraphEvents";
import { usePostListLikeToggle } from "./usePostListLikeToggle";

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
  /**
   * Após criar publicação: se o feed não está na página 1, volta à página 1 (recarrega do servidor).
   * Na página 1, insere o post no topo sem duplicar.
   */
  registerNewPostFromComposer: (post: Post) => void;
  togglePostLike: (postId: string) => Promise<void>;
  isPostLikePending: (postId: string) => boolean;
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
  const { togglePostLike, isPostLikePending } = usePostListLikeToggle(setPosts);
  const isFirstLoadRef = useRef(true);
  const pageRef = useRef(page);
  pageRef.current = page;
  const filterRef = useRef(filter);
  filterRef.current = filter;
  /** Troca de tab ou recarga “desde zero”: mostrar skeleton em vez de posts do filtro anterior. */
  const expectEmptyFeedRef = useRef(false);

  const fetchFeed = useCallback(async () => {
    void userDisplayRev;
    void communityDraftRev;
    void postInteractionRev;
    const treatAsFullLoad = isFirstLoadRef.current || expectEmptyFeedRef.current;
    if (expectEmptyFeedRef.current) expectEmptyFeedRef.current = false;

    setIsLoading(treatAsFullLoad);
    setIsRefreshing(!treatAsFullLoad);
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

  useEffect(() => {
    const onFollowGraphChanged = () => {
      if (filterRef.current !== "following") return;
      void fetchFeed();
    };
    window.addEventListener(SOCIAL_GRAPH_CHANGED_EVENT, onFollowGraphChanged);
    return () => window.removeEventListener(SOCIAL_GRAPH_CHANGED_EVENT, onFollowGraphChanged);
  }, [fetchFeed]);

  const setFilter = useCallback((newFilter: FeedFilter) => {
    setFilterState((prev) => {
      if (prev === newFilter) return prev;
      expectEmptyFeedRef.current = true;
      setPosts([]);
      setPage(1);
      setError(null);
      return newFilter;
    });
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

  const registerNewPostFromComposer = useCallback(
    (_post: Post) => {
      if (pageRef.current !== 1) {
        setPage(1);
        return;
      }
      void fetchFeed();
    },
    [fetchFeed]
  );

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
    registerNewPostFromComposer,
    togglePostLike,
    isPostLikePending,
  };
}
