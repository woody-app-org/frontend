/**
 * Contratos de leitura/mutação de posts para o mock.
 * TODO(backend): trocar implementações por `fetch`/`axios` apontando para rotas REST/GraphQL;
 * manter assinaturas ou adaptadores finos para não reescrever hooks/UI.
 */
import type { Comment, Post } from "../types";
import { enrichComment, getCommentsEnrichedByPostId, getPostById } from "../selectors";
import { appendCommentForPost, togglePostLikeForUser } from "../mocks/postInteractionMockStore";

const MOCK_DELAY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** TODO(backend): GET /posts/:postId */
export async function getPostByIdMock(postId: string, viewerId: string): Promise<Post | null> {
  await delay(MOCK_DELAY_MS);
  return getPostById(postId, viewerId) ?? null;
}

/** TODO(backend): GET /posts/:postId/comments */
export async function getCommentsByPostIdMock(postId: string): Promise<Comment[]> {
  await delay(Math.round(MOCK_DELAY_MS * 0.55));
  return getCommentsEnrichedByPostId(postId);
}

/** TODO(backend): POST /posts/:postId/like ou DELETE conforme estado */
export async function togglePostLikeMock(
  postId: string,
  viewerId: string
): Promise<{ likedByCurrentUser: boolean; likesCount: number } | null> {
  await delay(Math.round(MOCK_DELAY_MS * 0.45));
  return togglePostLikeForUser(viewerId, postId);
}

export type CreateCommentMockResult =
  | { ok: true; comment: Comment }
  | { ok: false; error: string };

/** TODO(backend): POST /posts/:postId/comments */
export async function createCommentMock(
  postId: string,
  viewerId: string,
  body: string
): Promise<CreateCommentMockResult> {
  await delay(Math.round(MOCK_DELAY_MS * 0.65));
  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "Escreva uma mensagem antes de enviar." };

  const row = appendCommentForPost({
    postId,
    authorId: viewerId,
    body: trimmed,
    createdAt: new Date().toISOString(),
  });
  if (!row) return { ok: false, error: "Post não encontrado." };
  return { ok: true, comment: enrichComment(row) };
}
