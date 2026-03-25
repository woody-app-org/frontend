import { useEffect, useMemo, useRef, useState } from "react";
import type { Community, Post, User } from "@/domain/types";
import { searchByMode, type SearchMode } from "../services/search.service";

export interface UseSearchParams {
  query: string;
  mode: SearchMode;
  debounceMs?: number;
}

export interface UseSearchReturn {
  isLoading: boolean;
  posts: Post[];
  people: User[];
  communities: Community[];
}

export function useSearch({ query, mode, debounceMs = 200 }: UseSearchParams): UseSearchReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [people, setPeople] = useState<User[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const lastReq = useRef(0);

  const effectiveQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    const reqId = ++lastReq.current;

    if (!effectiveQuery) {
      setIsLoading(false);
      setPosts([]);
      setPeople([]);
      setCommunities([]);
      return;
    }

    setIsLoading(true);
    const t = window.setTimeout(async () => {
      try {
        const result = await searchByMode({ query: effectiveQuery, mode });
        if (lastReq.current !== reqId) return;
        if (mode === "posts") {
          setPosts((result as { posts: Post[] }).posts ?? []);
          setPeople([]);
          setCommunities([]);
        } else if (mode === "people") {
          setPeople((result as { people: User[] }).people ?? []);
          setPosts([]);
          setCommunities([]);
        } else {
          setCommunities((result as { communities: Community[] }).communities ?? []);
          setPosts([]);
          setPeople([]);
        }
      } finally {
        if (lastReq.current === reqId) setIsLoading(false);
      }
    }, debounceMs);

    return () => window.clearTimeout(t);
  }, [debounceMs, effectiveQuery, mode]);

  return { isLoading, posts, people, communities };
}
