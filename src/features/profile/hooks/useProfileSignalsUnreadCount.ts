import { useCallback, useEffect, useState } from "react";
import { subscribeProfileSignalsChanged } from "@/lib/profileSignalsEvents";
import { fetchProfileSignalsUnreadCount } from "../services/profile-signals.service";

const REFRESH_INTERVAL_MS = 120_000;

/**
 * Contagem de sinais recebidos não lidos (backend). Atualiza ao focar a janela,
 * quando `PROFILE_SIGNALS_CHANGED` dispara e periodicamente de forma leve.
 */
export function useProfileSignalsUnreadCount(enabled: boolean) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setUnreadCount(0);
      return;
    }
    try {
      const n = await fetchProfileSignalsUnreadCount();
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
    const unsub = subscribeProfileSignalsChanged(() => void refresh());

    const id = window.setInterval(() => void refresh(), REFRESH_INTERVAL_MS);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      unsub();
      window.clearInterval(id);
    };
  }, [enabled, refresh]);

  return { unreadCount, refresh };
}
