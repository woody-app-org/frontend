/**
 * Contratos de leitura/mutação de posts e comentários para o mock.
 *
 * Integração futura: rotas em `src/lib/backendIntegrationHints.ts` (content + comentários).
 * TODO(backend): trocar implementações por `fetch`/`axios` apontando para rotas REST/GraphQL;
 * manter assinaturas ou adaptadores finos para não reescrever hooks/UI.
 *
 * ## Comentários (mapa para API futura)
 *
 * | Operação | Mock atual | Payload / notas |
 * |----------|------------|-----------------|
 * | Listar thread do post (raiz + aninhados) | `getCommentsByPostIdMock` | `GET /posts/:postId/comments` — hoje retorna lista plana; UI monta árvore. |
 * | Listar só replies de um comentário | `getRepliesByCommentIdMock` | `GET /comments/:id/replies` — pronto para paginação sob demanda. |
 * | Criar comentário raiz | `createCommentMock(..., null)` | `POST /posts/:postId/comments` body `{ content }`. |
 * | Criar resposta | `createCommentMock(..., parentId)` | mesmo endpoint + `{ content, parentCommentId }`. |
 *
 * A UI (`usePostDetail`) usa só listagem completa + `createComment`; `getRepliesByCommentIdMock` fica
 * disponível quando o backend paginar replies por nó.
 */
import type { Comment, Post } from "../types";
import {
  enrichComment,
  getCommentsEnrichedByPostId,
  getPostById,
  getRepliesEnrichedByCommentId,
} from "../selectors";
import {
  appendCommentForPost,
  getSeedPostRowById,
  togglePostLikeForUser,
} from "../mocks/postInteractionMockStore";

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
export async function getCommentsByPostIdMock(
  postId: string,
  viewerId?: string
): Promise<Comment[]> {
  await delay(Math.round(MOCK_DELAY_MS * 0.55));
  return getCommentsEnrichedByPostId(postId, viewerId);
}

/** TODO(backend): GET /comments/:parentCommentId/replies */
export async function getRepliesByCommentIdMock(
  parentCommentId: string,
  viewerId?: string
): Promise<Comment[]> {
  await delay(Math.round(MOCK_DELAY_MS * 0.5));
  return getRepliesEnrichedByCommentId(parentCommentId, viewerId);
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
  content: string,
  parentCommentId?: string | null
): Promise<CreateCommentMockResult> {
  await delay(Math.round(MOCK_DELAY_MS * 0.65));
  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "Escreva uma mensagem antes de enviar." };

  const row = appendCommentForPost({
    postId,
    authorId: viewerId,
    content: trimmed,
    createdAt: new Date().toISOString(),
    parentCommentId: parentCommentId ?? null,
  });
  if (!row) return { ok: false, error: "Não foi possível publicar (post ou comentário pai inválido)." };
  const postRow = getSeedPostRowById(postId);
  const postAuthorId = postRow?.authorId ?? "";
  return { ok: true, comment: enrichComment(row, { viewerId, postAuthorId }) };
}

/** Fachada única para trocar por cliente HTTP sem espalhar imports na UI. */
export const postCommentsMockApi = {
  listByPostId: getCommentsByPostIdMock,
  listRepliesByParentId: getRepliesByCommentIdMock,
  create: createCommentMock,
} as const;
