import { useCallback, useEffect, useState } from "react";
import { fetchNotificationsUnreadCount } from "../services/notifications.service";

const REFRESH_INTERVAL_MS = 90_000;

export function useNotificationsUnreadCount(enabled: boolean) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setUnreadCount(0);
      return;
    }
    try {
      const n = await fetchNotificationsUnreadCount();
      setUnreadCount(n);
    } catch {
      setUnreadCount(0);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!enabled) return;

    const onFocus = () => void refresh();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void refresh();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    const id = window.setInterval(() => void refresh(), REFRESH_INTERVAL_MS);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(id);
    };
  }, [enabled, refresh]);

  return { unreadCount, refresh };
}
