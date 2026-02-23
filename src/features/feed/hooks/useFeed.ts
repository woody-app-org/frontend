import { useState, useCallback, useEffect } from "react";
import type { Post, FeedFilter } from "../types";
import { getFeed } from "../services/feed.service";

interface UseFeedReturn {
  posts: Post[];
  isLoading: boolean;
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilterState] = useState<FeedFilter>("trending");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const fetchFeed = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getFeed(page, filter);
      setPosts(response.items);
      setHasNextPage(response.hasNextPage);
      setHasPreviousPage(response.hasPreviousPage);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Falha ao carregar feed"));
    } finally {
      setIsLoading(false);
    }
  }, [page, filter]);

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
