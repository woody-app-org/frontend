import type { NavigateFunction } from "react-router-dom";
import type { NotificationItem, NotificationType } from "../services/notifications.service";
import { notificationNavigationContext } from "../services/notifications.service";

function num(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && /^\d+$/.test(v)) return parseInt(v, 10);
  return undefined;
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

/**
 * Contexto de navegação: metadata/payload da API + fallbacks (`targetId` em posts, `actor` em follows).
 */
export function buildNotificationNavigationContext(item: NotificationItem): Record<string, unknown> {
  const ctx: Record<string, unknown> = { ...notificationNavigationContext(item) };
  const targetType = (item.targetType ?? "").toString().toLowerCase();

  if (num(ctx.postId) == null && targetType === "post" && item.targetId != null) {
    ctx.postId = item.targetId;
  }

  if (num(ctx.profileUserId) == null && item.type === "new_follower" && item.actor?.id) {
    const aid = num(item.actor.id);
    if (aid != null) ctx.profileUserId = aid;
  }

  return ctx;
}

function postWithCommentsFocus(postId: number, commentId?: number): string {
  const q = new URLSearchParams();
  q.set("focus", "comments");
  const base = `/posts/${postId}?${q.toString()}`;
  return commentId != null ? `${base}#comment-${commentId}` : base;
}

/**
 * Resolve a rota interna (path + query + hash) para uma notificação.
 * Centraliza todos os tipos — não duplicar switches noutros componentes.
 */
export function getNotificationTargetRoute(
  item: NotificationItem,
  viewerUserId?: string | null
): string | null {
  const ctx = buildNotificationNavigationContext(item);
  const postId = num(ctx.postId);
  const commentId = num(ctx.commentId);
  const profileUserId = num(ctx.profileUserId);
  const conversationId = num(ctx.conversationId);
  const communitySlug = str(ctx.communitySlug);

  switch (item.type) {
    case "post_like":
      return postId != null ? `/posts/${postId}` : null;

    case "post_comment":
      return postId != null ? postWithCommentsFocus(postId, commentId) : null;

    case "comment_reply":
      return postId != null ? postWithCommentsFocus(postId, commentId) : null;

    case "new_follower":
      if (profileUserId != null) return `/profile/${profileUserId}`;
      return null;

    case "profile_signal":
      if (viewerUserId) return `/profile/${viewerUserId}?tab=signals`;
      if (profileUserId != null) return `/profile/${profileUserId}`;
      return null;

    case "message_request":
      if (conversationId != null) return `/messages/${conversationId}`;
      return "/messages";

    case "community_request":
      if (communitySlug) return `/communities/${encodeURIComponent(communitySlug)}/admin`;
      return "/communities";

    case "community_request_approved":
      if (communitySlug) return `/communities/${encodeURIComponent(communitySlug)}`;
      return "/communities";

    default: {
      if (postId != null) return `/posts/${postId}`;
      if (conversationId != null) return `/messages/${conversationId}`;
      if (communitySlug) return `/communities/${encodeURIComponent(communitySlug)}`;
      if (profileUserId != null) return `/profile/${profileUserId}`;
      return null;
    }
  }
}

/**
 * @deprecated Preferir `getNotificationTargetRoute(item, viewerUserId)`.
 */
export function getNotificationHref(
  type: NotificationType,
  payload: Record<string, unknown>,
  viewerUserId?: string | null
): string | null {
  const item: NotificationItem = {
    id: "0",
    type,
    targetType: str(payload.targetType) ?? "none",
    targetId: num(payload.targetId) ?? null,
    metadata: { ...payload },
    createdAt: "",
    actor: null,
  };
  return getNotificationTargetRoute(item, viewerUserId);
}

export interface HandleNotificationClickOptions {
  notification: NotificationItem;
  viewerUserId: string | null | undefined;
  navigate: NavigateFunction;
  markReadIfNeeded: (id: string) => Promise<void>;
  onAfterRead?: () => void;
  onClose: () => void;
}

/**
 * Marca como lida (se aplicável), navega para o destino quando existir e fecha o popover/modal.
 */
export async function handleNotificationClick({
  notification,
  viewerUserId,
  navigate,
  markReadIfNeeded,
  onAfterRead,
  onClose,
}: HandleNotificationClickOptions): Promise<void> {
  if (!notification.readAt) {
    try {
      await markReadIfNeeded(notification.id);
      onAfterRead?.();
    } catch {
      /* segue para navegar/fechar */
    }
  }

  const route = getNotificationTargetRoute(notification, viewerUserId ?? null);
  if (route) {
    navigate(route);
  }
  onClose();
}
