import { startTransition, useCallback, useEffect, useState } from "react";
import { NOTIFICATIONS_SYNC_EVENT } from "../lib/notificationsRealtimeBus";
import { fetchNotificationsUnreadCount } from "../services/notifications.service";

const REFRESH_INTERVAL_MS = 90_000;

export function useNotificationsUnreadCount(enabled: boolean) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!enabled) {
      startTransition(() => {
        setUnreadCount(0);
      });
      return;
    }
    try {
      const n = await fetchNotificationsUnreadCount();
      startTransition(() => {
        setUnreadCount(n);
      });
    } catch {
      startTransition(() => {
        setUnreadCount(0);
      });
    }
  }, [enabled]);

  useEffect(() => {
    startTransition(() => {
      void refresh();
    });
  }, [refresh]);

  useEffect(() => {
    if (!enabled) return;

    const onFocus = () => void refresh();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const onRealtimeSync = () => void refresh();

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener(NOTIFICATIONS_SYNC_EVENT, onRealtimeSync);
    const id = window.setInterval(() => void refresh(), REFRESH_INTERVAL_MS);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener(NOTIFICATIONS_SYNC_EVENT, onRealtimeSync);
      window.clearInterval(id);
    };
  }, [enabled, refresh]);

  return { unreadCount, refresh };
}
