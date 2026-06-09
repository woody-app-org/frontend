import { useCallback, useEffect, useState } from "react";
import { fetchStoriesFeed } from "../services/stories.service";
import type { StoryFeedItem } from "../types";
import { STORIES_CHANGED_EVENT } from "../lib/storyEvents";

type FeedState = "idle" | "loading" | "ready" | "error";

/**
 * Ordena stories: não vistos primeiro (por recência), vistos depois (por recência).
 * isSelf sempre primeiro — mas isSelf é separado antes de chegar aqui no FeedPage,
 * então o sort é aplicado apenas aos "others".
 */
function sortStories(items: StoryFeedItem[]): StoryFeedItem[] {
  return [...items].sort((a, b) => {
    // Self sempre no início
    if (a.isSelf && !b.isSelf) return -1;
    if (!a.isSelf && b.isSelf) return 1;

    // Não vistos antes dos vistos
    if (a.hasUnviewedStories !== b.hasUnviewedStories) {
      return a.hasUnviewedStories ? -1 : 1;
    }

    // Dentro do mesmo grupo: mais recente primeiro
    const timeA = a.lastStoryCreatedAt ? new Date(a.lastStoryCreatedAt).getTime() : 0;
    const timeB = b.lastStoryCreatedAt ? new Date(b.lastStoryCreatedAt).getTime() : 0;
    return timeB - timeA;
  });
}

export function useStoriesFeed(enabled: boolean) {
  const [items, setItems] = useState<StoryFeedItem[]>([]);
  const [state, setState] = useState<FeedState>("idle");

  const refresh = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setState((prev) => (prev === "ready" ? "ready" : "loading"));
    try {
      const next = await fetchStoriesFeed();
      setItems(sortStories(next));
      setState("ready");
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn("[Woody] stories feed failed", e);
      }
      setItems([]);
      setState("error");
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    void fetchStoriesFeed()
      .then((next) => {
        if (cancelled) return;
        setItems(sortStories(next));
        setState("ready");
      })
      .catch((e) => {
        if (cancelled) return;
        if (import.meta.env.DEV) {
          console.warn("[Woody] stories feed failed", e);
        }
        setItems([]);
        setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const onChanged = () => void refresh();
    window.addEventListener(STORIES_CHANGED_EVENT, onChanged);
    return () => window.removeEventListener(STORIES_CHANGED_EVENT, onChanged);
  }, [enabled, refresh]);

  /**
   * Marca um utilizador como "stories vistos" imediatamente no estado local,
   * sem esperar pelo próximo re-fetch. Atualiza o visual do aro na StoriesBar
   * assim que o story viewer é aberto.
   *
   * Não re-ordena a lista para evitar que o item salte enquanto o utilizador
   * ainda está a ver — a ordenação é recalculada no próximo fetch completo.
   */
  const markUserViewed = useCallback((userId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.userId === userId
          ? { ...item, hasUnviewedStories: false }
          : item
      )
    );
  }, []);

  const activeState = enabled ? state : "idle";
  const activeItems = enabled ? items : [];

  return {
    items: activeItems,
    isLoading: enabled && (activeState === "loading" || activeState === "idle"),
    isError: enabled && activeState === "error",
    refresh,
    markUserViewed,
  };
}
