/**
 * Mutações mock de gestão/moderacao de conteúdo.
 *
 * Integração futura: ver `BACKEND_ROUTE_HINTS.content` em `src/lib/backendIntegrationHints.ts`.
 * Substituições típicas: `fetch`/`axios` por função, mantendo `ContentModerationResult` ou adapter.
 *
 * | Mock | Alvo HTTP (hint) |
 * |------|------------------|
 * | `updatePostMock` | PATCH /posts/:postId |
 * | `deletePostMock` | DELETE /posts/:postId |
 * | `deleteCommentMock` | DELETE /comments/:commentId |
 * | `hideCommentMock` | POST ocultar comentário |
 * | `reportPostMock` / `reportCommentMock` | POST /reports |
 */
import {
  canDeleteOwnComment,
  canDeletePost,
  canEditPost,
  canHideCommentOnOwnedPost,
  canReportComment,
  canReportPost,
} from "../contentModerationPermissions";
import {
  recordCommentReport,
  recordPostReport,
} from "../mocks/contentReportMockStore";
import {
  getSeedCommentRowById,
  getSeedPostRowById,
  hideCommentRowForPostAuthor,
  softDeleteCommentRowForAuthor,
  softDeletePostRowForAuthor,
  updatePostRowForAuthor,
} from "../mocks/postInteractionMockStore";
import { enrichComment, enrichPost, getPostById } from "../selectors";
import type { SubmitContentReportInput } from "../contentReport";
import type { Comment, Post } from "../types";

const MOCK_DELAY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type ContentModerationErrorCode =
  | "unauthorized"
  | "not_found"
  | "validation"
  | "conflict"
  | "unknown";

export type ContentModerationResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: ContentModerationErrorCode; message: string };

/** TODO(backend): PATCH /posts/:postId */
export async function updatePostMock(
  postId: string,
  viewerId: string,
  patch: { title: string; content: string }
): Promise<ContentModerationResult<Post>> {
  await delay(MOCK_DELAY_MS);
  const current = getPostById(postId, viewerId);
  if (!current) {
    return { ok: false, code: "not_found", message: "Publicação não encontrada." };
  }
  if (!canEditPost(viewerId, current)) {
    return { ok: false, code: "unauthorized", message: "Você não pode editar esta publicação." };
  }
  const row = updatePostRowForAuthor(viewerId, postId, patch);
  if (!row) {
    return { ok: false, code: "validation", message: "Título e texto são obrigatórios." };
  }
  const next = enrichPost(row, viewerId);
  return { ok: true, data: next };
}

/** TODO(backend): DELETE /posts/:postId (soft) */
export async function deletePostMock(
  postId: string,
  viewerId: string
): Promise<ContentModerationResult<{ removed: true }>> {
  await delay(MOCK_DELAY_MS);
  const current = getPostById(postId, viewerId);
  if (!current) {
    return { ok: false, code: "not_found", message: "Publicação não encontrada." };
  }
  if (!canDeletePost(viewerId, current)) {
    return { ok: false, code: "unauthorized", message: "Você não pode remover esta publicação." };
  }
  const ok = softDeletePostRowForAuthor(viewerId, postId);
  if (!ok) {
    return { ok: false, code: "unknown", message: "Não foi possível remover a publicação." };
  }
  return { ok: true, data: { removed: true } };
}

/** TODO(backend): DELETE /comments/:commentId */
export async function deleteCommentMock(
  commentId: string,
  viewerId: string
): Promise<ContentModerationResult<{ removed: true }>> {
  await delay(Math.round(MOCK_DELAY_MS * 0.75));
  const row = getSeedCommentRowById(commentId);
  if (!row) {
    return { ok: false, code: "not_found", message: "Comentário não encontrado." };
  }
  const postRow = getSeedPostRowById(row.postId);
  if (!postRow) {
    return { ok: false, code: "not_found", message: "Publicação não encontrada." };
  }
  const post = enrichPost(postRow, viewerId);
  const comment = enrichComment(row, {
    viewerId,
    postAuthorId: postRow.authorId,
  });
  if (!canDeleteOwnComment(viewerId, post, comment)) {
    return { ok: false, code: "unauthorized", message: "Você não pode excluir este comentário." };
  }
  const ok = softDeleteCommentRowForAuthor(viewerId, commentId);
  if (!ok) {
    return { ok: false, code: "unknown", message: "Não foi possível excluir o comentário." };
  }
  return { ok: true, data: { removed: true } };
}

/** TODO(backend): POST /posts/:postId/comments/:commentId/hide ou PATCH com flag */
export async function hideCommentMock(
  commentId: string,
  viewerId: string
): Promise<ContentModerationResult<Comment>> {
  await delay(Math.round(MOCK_DELAY_MS * 0.75));
  const row = getSeedCommentRowById(commentId);
  if (!row) {
    return { ok: false, code: "not_found", message: "Comentário não encontrado." };
  }
  const postRow = getSeedPostRowById(row.postId);
  if (!postRow) {
    return { ok: false, code: "not_found", message: "Publicação não encontrada." };
  }
  const post = enrichPost(postRow, viewerId);
  const comment = enrichComment(row, {
    viewerId,
    postAuthorId: postRow.authorId,
  });
  if (!canHideCommentOnOwnedPost(viewerId, post, comment)) {
    return {
      ok: false,
      code: "unauthorized",
      message: "Só a autora do post pode ocultar comentários de outras pessoas.",
    };
  }
  const ok = hideCommentRowForPostAuthor(viewerId, commentId);
  if (!ok) {
    return { ok: false, code: "unknown", message: "Não foi possível ocultar o comentário." };
  }
  const nextRow = getSeedCommentRowById(commentId);
  if (!nextRow) {
    return { ok: false, code: "unknown", message: "Estado inconsistente após ocultar." };
  }
  return {
    ok: true,
    data: enrichComment(nextRow, { viewerId, postAuthorId: postRow.authorId }),
  };
}

/** TODO(backend): POST /reports { targetType: 'post', postId, reasonCode, details? } */
export async function reportPostMock(
  postId: string,
  viewerId: string,
  input: SubmitContentReportInput
): Promise<ContentModerationResult<{ reported: true }>> {
  await delay(Math.round(MOCK_DELAY_MS * 0.6));
  const details = input.details?.trim() || undefined;
  const current = getPostById(postId, viewerId);
  if (!current) {
    return { ok: false, code: "not_found", message: "Publicação não encontrada." };
  }
  if (!canReportPost(viewerId, current)) {
    return {
      ok: false,
      code: "unauthorized",
      message: "Não é possível denunciar esta publicação.",
    };
  }
  const first = recordPostReport(viewerId, postId, {
    reasonCode: input.reasonCode,
    details,
  });
  if (!first) {
    return { ok: false, code: "conflict", message: "Você já enviou uma denúncia para este conteúdo." };
  }
  return { ok: true, data: { reported: true } };
}

/** TODO(backend): POST /reports { targetType: 'comment', commentId, postId, reasonCode, details? } */
export async function reportCommentMock(
  commentId: string,
  viewerId: string,
  input: SubmitContentReportInput
): Promise<ContentModerationResult<{ reported: true }>> {
  await delay(Math.round(MOCK_DELAY_MS * 0.6));
  const details = input.details?.trim() || undefined;
  const row = getSeedCommentRowById(commentId);
  if (!row) {
    return { ok: false, code: "not_found", message: "Comentário não encontrado." };
  }
  const postRow = getSeedPostRowById(row.postId);
  if (!postRow) {
    return { ok: false, code: "not_found", message: "Publicação não encontrada." };
  }
  const post = enrichPost(postRow, viewerId);
  const comment = enrichComment(row, {
    viewerId,
    postAuthorId: postRow.authorId,
  });
  if (!canReportComment(viewerId, post, comment)) {
    return {
      ok: false,
      code: "unauthorized",
      message: "Não é possível denunciar este comentário.",
    };
  }
  const first = recordCommentReport(viewerId, commentId, {
    postId: row.postId,
    reasonCode: input.reasonCode,
    details,
  });
  if (!first) {
    return { ok: false, code: "conflict", message: "Você já enviou uma denúncia para este conteúdo." };
  }
  return { ok: true, data: { reported: true } };
}

/** Fachada para substituição por API real sem espalhar imports na UI. */
export const contentModerationMockApi = {
  updatePost: updatePostMock,
  deletePost: deletePostMock,
  deleteComment: deleteCommentMock,
  hideComment: hideCommentMock,
  reportPost: reportPostMock,
  reportComment: reportCommentMock,
} as const;
