import { api } from "@/lib/api";

export type UserNotificationType =
  | "post_like"
  | "post_comment"
  | "comment_reply"
  | "new_follower"
  | "profile_signal"
  | "message_request"
  | "community_request"
  | "community_request_approved"
  | string;

export interface NotificationActor {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  bio?: string | null;
  pronouns?: string | null;
  showProBadge: boolean;
}

export interface UserNotificationItem {
  id: string;
  type: UserNotificationType;
  createdAtUtc: string;
  readAtUtc?: string | null;
  actor: NotificationActor | null;
  payload: Record<string, unknown>;
}

export interface UserNotificationListResponse {
  items: UserNotificationItem[];
  total: number;
  page: number;
  pageSize: number;
}

export async function fetchNotificationsPage(page = 1, pageSize = 30): Promise<UserNotificationListResponse> {
  const { data } = await api.get<UserNotificationListResponse>("notifications", { params: { page, pageSize } });
  return data;
}

export async function fetchNotificationsUnreadCount(): Promise<number> {
  const { data } = await api.get<{ count: number }>("notifications/unread-count");
  return typeof data.count === "number" ? data.count : 0;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.post(`notifications/${encodeURIComponent(id)}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post("notifications/read-all");
}
