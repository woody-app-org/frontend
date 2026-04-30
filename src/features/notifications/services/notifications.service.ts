import { api } from "@/lib/api";

export type NotificationType =
  | "post_like"
  | "post_comment"
  | "comment_reply"
  | "new_follower"
  | "profile_signal"
  | "message_request"
  | "community_request"
  | "community_request_approved"
  | string;

/** @deprecated use NotificationType */
export type UserNotificationType = NotificationType;

export interface NotificationActor {
  id: string;
  displayName: string;
  username: string;
  avatar?: string | null;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  targetType: string;
  targetId?: number | null;
  title?: string | null;
  message?: string | null;
  metadata: Record<string, unknown>;
  /** Alias legado; preferir `metadata`. */
  payload?: Record<string, unknown>;
  createdAt: string;
  readAt?: string | null;
  actor: NotificationActor | null;
}

/** @deprecated use NotificationItem */
export type UserNotificationItem = NotificationItem;

export interface NotificationListResponse {
  items: NotificationItem[];
  total: number;
  page: number;
  pageSize: number;
}

/** @deprecated use NotificationListResponse */
export type UserNotificationListResponse = NotificationListResponse;

/** Contexto de navegação (metadata da API; fallback a payload legado). */
export function notificationNavigationContext(n: NotificationItem): Record<string, unknown> {
  const meta = n.metadata;
  if (meta && typeof meta === "object" && !Array.isArray(meta)) return meta as Record<string, unknown>;
  const p = n.payload;
  if (p && typeof p === "object" && !Array.isArray(p)) return p as Record<string, unknown>;
  return {};
}

export async function fetchNotificationsPage(page = 1, pageSize = 30): Promise<NotificationListResponse> {
  const { data } = await api.get<NotificationListResponse>("notifications", { params: { page, pageSize } });
  return data;
}

export async function fetchNotificationsUnreadCount(): Promise<number> {
  const { data } = await api.get<{ count: number }>("notifications/unread-count");
  return typeof data.count === "number" ? data.count : 0;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`notifications/${encodeURIComponent(id)}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.patch("notifications/read-all");
}
