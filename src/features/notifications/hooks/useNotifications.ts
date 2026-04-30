import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchNotificationsPage,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "../services/notifications.service";
import { getApiErrorMessage } from "@/lib/api";

export type NotificationFilter = "all" | "unread" | "comments";

export interface UseNotificationsOptions {
  /** Só faz pedidos quando true (ex.: utilizadora autenticada). */
  enabled: boolean;
  /** Quando o painel abre, recarrega a lista (dados frescos). */
  isOpen: boolean;
  pageSize?: number;
}

export function useNotifications({ enabled, isOpen, pageSize = 40 }: UseNotificationsOptions) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setItems([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const page = await fetchNotificationsPage(1, pageSize);
      setItems(page.items);
    } catch (e) {
      setError(getApiErrorMessage(e, "Não foi possível carregar as notificações."));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, pageSize]);

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setError(null);
      return;
    }
    if (!isOpen) return;
    void refetch();
  }, [enabled, isOpen, refetch]);

  const filteredItems = useMemo(() => {
    if (filter === "unread") return items.filter((n) => !n.readAt);
    if (filter === "comments") return items.filter((n) => n.type === "post_comment" || n.type === "comment_reply");
    return items;
  }, [items, filter]);

  const markAllRead = useCallback(async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    } catch (e) {
      setError(getApiErrorMessage(e, "Não foi possível marcar tudo como lido."));
    } finally {
      setMarkingAll(false);
    }
  }, []);

  const markOneRead = useCallback(async (id: string) => {
    await markNotificationRead(id);
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, readAt: new Date().toISOString() } : x)));
  }, []);

  return {
    items,
    setItems,
    filteredItems,
    filter,
    setFilter,
    loading,
    error,
    setError,
    refetch,
    markingAll,
    markAllRead,
    markOneRead,
  };
}
