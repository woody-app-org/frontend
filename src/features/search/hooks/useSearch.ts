import { useEffect, useMemo, useRef, useState } from "react";
import type { Post, User } from "@/features/feed/types";
import { searchByMode, type SearchMode, type SearchSource } from "../services/search.service";

export interface UseSearchParams {
  query: string;
  mode: SearchMode;
  source: SearchSource;
  debounceMs?: number;
}

export interface UseSearchReturn {
  isLoading: boolean;
  posts: Post[];
  people: User[];
}

export function useSearch({ query, mode, source, debounceMs = 200 }: UseSearchParams): UseSearchReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [people, setPeople] = useState<User[]>([]);
  const lastReq = useRef(0);

  const effectiveQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    const reqId = ++lastReq.current;

    if (!effectiveQuery) {
      setIsLoading(false);
      setPosts([]);
      setPeople([]);
      return;
    }

    setIsLoading(true);
    const t = window.setTimeout(async () => {
      try {
        const result = await searchByMode({ query: effectiveQuery, mode, source });
        if (lastReq.current !== reqId) return;

        if (mode === "topics") {
          setPosts((result as { posts: Post[] }).posts ?? []);
          setPeople([]);
        } else {
          setPeople((result as { people: User[] }).people ?? []);
          setPosts([]);
        }
      } finally {
        if (lastReq.current === reqId) setIsLoading(false);
      }
    }, debounceMs);

    return () => window.clearTimeout(t);
  }, [debounceMs, effectiveQuery, mode, source]);

  return { isLoading, posts, people };
}

