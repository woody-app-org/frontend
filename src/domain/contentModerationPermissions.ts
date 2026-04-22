import type { Comment, Post } from "./types";
import {
  hasViewerReportedComment,
  hasViewerReportedPost,
} from "./mocks/contentReportMockStore";

function isPostActive(post: Post): boolean {
  return post.deletedAt == null || post.deletedAt === "";
}

function isCommentActive(comment: Comment): boolean {
  return comment.deletedAt == null || comment.deletedAt === "";
}

export function canEditPost(viewerId: string | null | undefined, post: Post): boolean {
  if (!viewerId || !isPostActive(post)) return false;
  return post.authorId === viewerId;
}

export function canDeletePost(viewerId: string | null | undefined, post: Post): boolean {
  if (!viewerId || !isPostActive(post)) return false;
  return post.authorId === viewerId;
}

/**
 * Pode ver ações de destacar publicação no perfil: só no próprio perfil e só em posts da própria autora
 * (alinhado a `PostProfilePinPolicy` no backend; soft-delete tratado pelo cartão).
 */
export function canManageOwnPostProfilePin(
  viewerId: string | null | undefined,
  post: Post,
  options: { viewingOwnProfile: boolean }
): boolean {
  if (!viewerId || !options.viewingOwnProfile || !isPostActive(post)) return false;
  return post.authorId === viewerId;
}

export function canDeleteOwnComment(
  viewerId: string | null | undefined,
  post: Post,
  comment: Comment
): boolean {
  if (!viewerId || !isPostActive(post) || !isCommentActive(comment)) return false;
  if (comment.postId !== post.id) return false;
  return comment.authorId === viewerId;
}

export function canHideCommentOnOwnedPost(
  viewerId: string | null | undefined,
  post: Post,
  comment: Comment
): boolean {
  if (!viewerId || !isPostActive(post) || !isCommentActive(comment)) return false;
  if (comment.postId !== post.id) return false;
  if (post.authorId !== viewerId) return false;
  if (comment.authorId === viewerId) return false;
  if (comment.hiddenByPostAuthorAt) return false;
  return true;
}

export function canReportPost(viewerId: string | null | undefined, post: Post): boolean {
  if (!viewerId || !isPostActive(post)) return false;
  if (post.authorId === viewerId) return false;
  if (hasViewerReportedPost(viewerId, post.id)) return false;
  return true;
}

export function canReportComment(
  viewerId: string | null | undefined,
  post: Post,
  comment: Comment
): boolean {
  if (!viewerId || !isPostActive(post) || !isCommentActive(comment)) return false;
  if (comment.postId !== post.id) return false;
  if (comment.authorId === viewerId) return false;
  if (hasViewerReportedComment(viewerId, comment.id)) return false;
  return true;
}

/** Autora do post pode destacar um comentário raiz visível (regra alinhada ao backend). */
export function canPinCommentAsPostAuthor(
  viewerId: string | null | undefined,
  post: Post,
  comment: Comment
): boolean {
  if (!viewerId || !isPostActive(post) || !isCommentActive(comment)) return false;
  if (comment.postId !== post.id) return false;
  if (post.authorId !== viewerId) return false;
  if (comment.parentCommentId != null) return false;
  if (comment.hiddenByPostAuthorAt) return false;
  if (comment.pinnedOnPostAt) return false;
  return true;
}

/** Autora do post pode remover o destaque do comentário atualmente fixado. */
export function canUnpinCommentAsPostAuthor(
  viewerId: string | null | undefined,
  post: Post,
  comment: Comment
): boolean {
  if (!viewerId || !isPostActive(post) || !isCommentActive(comment)) return false;
  if (comment.postId !== post.id) return false;
  if (post.authorId !== viewerId) return false;
  return Boolean(comment.pinnedOnPostAt);
}
