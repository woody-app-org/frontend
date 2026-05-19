import { useCallback, useEffect, useState } from "react";
import { fetchStoriesFeed } from "../services/stories.service";
import type { StoryFeedItem } from "../types";
import { STORIES_CHANGED_EVENT } from "../lib/storyEvents";

type FeedState = "idle" | "loading" | "ready" | "error";

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
      setItems(next);
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
        setItems(next);
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

  const activeState = enabled ? state : "idle";
  const activeItems = enabled ? items : [];

  return {
    items: activeItems,
    isLoading: enabled && (activeState === "loading" || activeState === "idle"),
    isError: enabled && activeState === "error",
    refresh,
  };
}
