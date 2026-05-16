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

function appendPostsDeduped(existing: Post[], incoming: Post[]): Post[] {
  const seen = new Set(existing.map((p) => p.id));
  const out = [...existing];
  for (const p of incoming) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
  }
  return out;
}

interface UseFeedReturn {
  posts: Post[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  hasLoadedOnce: boolean;
  error: Error | null;
  loadMoreError: Error | null;
  page: number;
  hasNextPage: boolean;
  filter: FeedFilter;
  setFilter: (filter: FeedFilter) => void;
  refreshFeed: () => Promise<void>;
  loadMore: () => Promise<void>;
  /**
   * Após criar publicação: recarrega desde a página 1 (substitui a lista acumulada).
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilterState] = useState<FeedFilter>("trending");
  const [hasNextPage, setHasNextPage] = useState(false);

  const filterRef = useRef(filter);
  filterRef.current = filter;
  const pageRef = useRef(page);
  pageRef.current = page;
  const postsRef = useRef(posts);
  postsRef.current = posts;
  const hasNextPageRef = useRef(hasNextPage);
  hasNextPageRef.current = hasNextPage;

  const loadMoreInFlightRef = useRef(false);

  const { togglePostLike, isPostLikePending } = usePostListLikeToggle(setPosts);

  const loadFirstPage = useCallback(async () => {
    const filterSnapshot = filterRef.current;
    const hadPosts = postsRef.current.length > 0;

    setError(null);
    setLoadMoreError(null);

    if (!hadPosts) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const response = await getFeed(1, filterSnapshot, viewerId);
      if (filterRef.current !== filterSnapshot) return;

      setPosts(response.items);
      setPage(1);
      setHasNextPage(response.hasNextPage);
      setHasLoadedOnce(true);
    } catch (err) {
      if (filterRef.current === filterSnapshot) {
        setError(err instanceof Error ? err : new Error("Falha ao carregar feed"));
      }
    } finally {
      if (filterRef.current === filterSnapshot) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [viewerId]);

  useEffect(() => {
    void userDisplayRev;
    void communityDraftRev;
    void postInteractionRev;
    void loadFirstPage();
  }, [filter, viewerId, userDisplayRev, communityDraftRev, postInteractionRev, loadFirstPage]);

  useEffect(() => {
    const onFollowGraphChanged = () => {
      if (filterRef.current !== "following") return;
      void loadFirstPage();
    };
    window.addEventListener(SOCIAL_GRAPH_CHANGED_EVENT, onFollowGraphChanged);
    return () => window.removeEventListener(SOCIAL_GRAPH_CHANGED_EVENT, onFollowGraphChanged);
  }, [loadFirstPage]);

  const setFilter = useCallback((newFilter: FeedFilter) => {
    setFilterState((prev) => {
      if (prev === newFilter) return prev;
      setPosts([]);
      setPage(1);
      setHasNextPage(false);
      setError(null);
      setLoadMoreError(null);
      return newFilter;
    });
  }, []);

  const refreshFeed = useCallback(async () => {
    await loadFirstPage();
  }, [loadFirstPage]);

  const loadMore = useCallback(async () => {
    if (
      !hasNextPageRef.current ||
      loadMoreInFlightRef.current ||
      isLoading ||
      isLoadingMore ||
      isRefreshing
    ) {
      return;
    }

    const filterSnapshot = filterRef.current;
    const nextPageNum = pageRef.current + 1;

    loadMoreInFlightRef.current = true;
    setIsLoadingMore(true);
    setLoadMoreError(null);

    try {
      const response = await getFeed(nextPageNum, filterSnapshot, viewerId);
      if (filterRef.current !== filterSnapshot) return;

      setPosts((prev) => appendPostsDeduped(prev, response.items));
      setPage(nextPageNum);
      setHasNextPage(response.hasNextPage);
    } catch (err) {
      if (filterRef.current === filterSnapshot) {
        setLoadMoreError(
          err instanceof Error ? err : new Error("Não foi possível carregar mais publicações.")
        );
      }
    } finally {
      loadMoreInFlightRef.current = false;
      setIsLoadingMore(false);
    }
  }, [viewerId, isLoading, isLoadingMore, isRefreshing]);

  const registerNewPostFromComposer = useCallback(
    (_post: Post) => {
      void loadFirstPage();
    },
    [loadFirstPage]
  );

  return {
    posts,
    isLoading,
    isLoadingMore,
    isRefreshing,
    hasLoadedOnce,
    error,
    loadMoreError,
    page,
    hasNextPage,
    filter,
    setFilter,
    refreshFeed,
    loadMore,
    registerNewPostFromComposer,
    togglePostLike,
    isPostLikePending,
  };
}
