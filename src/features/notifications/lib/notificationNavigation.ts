import type { NotificationType } from "../services/notifications.service";

function num(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && /^\d+$/.test(v)) return parseInt(v, 10);
  return undefined;
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v : undefined;
}

/**
 * Destino ao clicar numa notificação (rotas da app).
 * @param viewerUserId id da utilizadora autenticada (para sinais recebidos → separador sinais no próprio perfil).
 */
export function getNotificationHref(
  type: NotificationType,
  payload: Record<string, unknown>,
  viewerUserId?: string | null
): string | null {
  const postId = num(payload.postId);
  const commentId = num(payload.commentId);
  const profileUserId = num(payload.profileUserId);
  const conversationId = num(payload.conversationId);
  const communitySlug = str(payload.communitySlug);

  switch (type) {
    case "post_like":
    case "post_comment":
      if (postId != null) return `/posts/${postId}`;
      return null;
    case "comment_reply":
      if (postId != null) {
        const hash = commentId != null ? `#comment-${commentId}` : "";
        return `/posts/${postId}${hash}`;
      }
      return null;
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
    default:
      if (postId != null) return `/posts/${postId}`;
      if (conversationId != null) return `/messages/${conversationId}`;
      if (communitySlug) return `/communities/${encodeURIComponent(communitySlug)}`;
      if (profileUserId != null) return `/profile/${profileUserId}`;
      return null;
  }
}
