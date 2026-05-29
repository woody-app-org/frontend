import type { Location, NavigateFunction } from "react-router-dom";
import type { NotificationItem, NotificationType } from "../services/notifications.service";
import { notificationNavigationContext } from "../services/notifications.service";
import {
  buildPostDetailNavState,
  routeTargetsPostDetail,
} from "@/features/feed/lib/postDetailNavState";
import { postPath } from "@/features/feed/lib/postPaths";
import { isLegacyNumericProfileParam, profilePath, profilePathForUser } from "@/features/profile/lib/profilePaths";

export type ViewerProfileNav = {
  userId?: string | null;
  username?: string | null;
};

function normalizeViewer(viewer?: ViewerProfileNav | string | null): ViewerProfileNav {
  if (typeof viewer === "string") return { userId: viewer };
  return viewer ?? {};
}

function num(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && /^\d+$/.test(v)) return parseInt(v, 10);
  return undefined;
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function profileRouteFromMetadata(
  metadata: Record<string, unknown>,
  actor: NotificationItem["actor"]
): string | null {
  const actorUsername = str(metadata.actorUsername) ?? actor?.username?.trim();
  if (actorUsername) return profilePath(actorUsername);

  const profileUserId = num(metadata.profileUserId);
  if (profileUserId != null) return profilePath(String(profileUserId));

  if (actor?.id) {
    const actorId = str(actor.id);
    if (actorId && isLegacyNumericProfileParam(actorId)) return profilePath(actorId);
  }

  return null;
}

function profileRouteForViewer(viewer: ViewerProfileNav): string | null {
  const username = viewer.username?.trim();
  if (username) return `${profilePath(username)}?tab=signals`;
  const userId = viewer.userId?.trim();
  if (userId) return `${profilePath(userId)}?tab=signals`;
  return null;
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

  if (str(ctx.actorUsername) == null && item.actor?.username?.trim()) {
    ctx.actorUsername = item.actor.username.trim();
  }

  return ctx;
}

function postRouteFromMetadata(ctx: Record<string, unknown>): string | null {
  const postPublicId = str(ctx.postPublicId);
  if (postPublicId) return postPath(postPublicId);
  const postId = num(ctx.postId);
  if (postId != null) return postPath(String(postId));
  return null;
}

function postWithCommentsFocusFromMetadata(ctx: Record<string, unknown>, commentId?: number): string | null {
  const postPublicId = str(ctx.postPublicId);
  const postId = num(ctx.postId);
  const handle = postPublicId ?? (postId != null ? String(postId) : null);
  if (!handle) return null;

  const q = new URLSearchParams();
  q.set("focus", "comments");
  const base = `${postPath(handle)}?${q.toString()}`;
  return commentId != null ? `${base}#comment-${commentId}` : base;
}

/**
 * Resolve a rota interna (path + query + hash) para uma notificação.
 * Centraliza todos os tipos — não duplicar switches noutros componentes.
 */
export function getNotificationTargetRoute(
  item: NotificationItem,
  viewer?: ViewerProfileNav | string | null
): string | null {
  const viewerCtx = normalizeViewer(viewer);
  const ctx = buildNotificationNavigationContext(item);
  const commentId = num(ctx.commentId);
  const conversationId = num(ctx.conversationId);
  const communitySlug = str(ctx.communitySlug);

  switch (item.type) {
    case "post_like":
      return postRouteFromMetadata(ctx);

    case "post_comment":
      return postWithCommentsFocusFromMetadata(ctx, commentId);

    case "post_shared":
      return postRouteFromMetadata(ctx);

    case "comment_reply":
      return postWithCommentsFocusFromMetadata(ctx, commentId);

    case "new_follower":
      return profileRouteFromMetadata(ctx, item.actor);

    case "profile_signal":
      return profileRouteForViewer(viewerCtx) ?? profileRouteFromMetadata(ctx, item.actor);

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
      const postRoute = postRouteFromMetadata(ctx);
      if (postRoute) return postRoute;
      if (conversationId != null) return `/messages/${conversationId}`;
      if (communitySlug) return `/communities/${encodeURIComponent(communitySlug)}`;
      return profileRouteFromMetadata(ctx, item.actor);
    }
  }
}

/**
 * @deprecated Preferir `getNotificationTargetRoute(item, viewerUserId)`.
 */
export function getNotificationHref(
  type: NotificationType,
  payload: Record<string, unknown>,
  viewer?: ViewerProfileNav | string | null
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
  return getNotificationTargetRoute(item, viewer);
}

export interface HandleNotificationClickOptions {
  notification: NotificationItem;
  viewer?: ViewerProfileNav | string | null;
  /** @deprecated Preferir `viewer`. */
  viewerUserId?: string | null;
  navigate: NavigateFunction;
  markReadIfNeeded: (id: string) => Promise<void>;
  onAfterRead?: () => void;
  onClose: () => void;
  /** Página onde o utilizador estava ao abrir a notificação — usado para “Voltar” em posts. */
  currentLocation?: Pick<Location, "pathname" | "search" | "hash">;
}

/**
 * Marca como lida (se aplicável), navega para o destino quando existir e fecha o popover/modal.
 */
export async function handleNotificationClick({
  notification,
  viewer,
  viewerUserId,
  navigate,
  markReadIfNeeded,
  onAfterRead,
  onClose,
  currentLocation,
}: HandleNotificationClickOptions): Promise<void> {
  const viewerCtx = normalizeViewer(viewer ?? viewerUserId);
  if (!notification.readAt) {
    try {
      await markReadIfNeeded(notification.id);
      onAfterRead?.();
    } catch {
      /* segue para navegar/fechar */
    }
  }

  const route = getNotificationTargetRoute(notification, viewerCtx);
  if (route) {
    if (routeTargetsPostDetail(route) && currentLocation) {
      navigate(route, { state: buildPostDetailNavState(currentLocation) });
    } else {
      navigate(route);
    }
  }
  onClose();
}

/** Helper para links de perfil a partir de actor da notificação. */
export function notificationActorProfilePath(actor: NotificationItem["actor"]): string | null {
  if (!actor) return null;
  if (actor.username?.trim()) return profilePath(actor.username.trim());
  if (actor.id) return profilePathForUser({ id: actor.id, username: actor.username });
  return null;
}
