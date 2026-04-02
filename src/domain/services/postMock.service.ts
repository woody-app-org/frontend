/**
 * Leitura e mutação de posts e comentários via API Woody.
 */
import type { Comment, Post } from "../types";
import { api, getApiErrorMessage } from "@/lib/api";
import { mapCommentFromApi, mapPostFromApi } from "@/lib/apiMappers";
import axios from "axios";

export async function getPostByIdMock(postId: string, viewerId: string): Promise<Post | null> {
  try {
    const { data } = await api.get(`/posts/${encodeURIComponent(postId)}`);
    return mapPostFromApi(data as Record<string, unknown>, viewerId);
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) return null;
    throw new Error(getApiErrorMessage(e, "Falha ao carregar o post."));
  }
}

export async function getCommentsByPostIdMock(postId: string, _viewerId?: string): Promise<Comment[]> {
  const { data } = await api.get(`/posts/${encodeURIComponent(postId)}/comments`);
  const list = data as unknown[];
  return list.map((c) => mapCommentFromApi(c as Record<string, unknown>));
}

export async function getRepliesByCommentIdMock(
  _parentCommentId: string,
  _viewerId?: string
): Promise<Comment[]> {
  // A API atual devolve a lista completa em GET /posts/:id/comments; a UI monta a árvore localmente.
  return [];
}

export async function togglePostLikeMock(
  postId: string,
  viewerId: string
): Promise<{ likedByCurrentUser: boolean; likesCount: number } | null> {
  const post = await getPostByIdMock(postId, viewerId);
  if (!post) return null;
  try {
    if (post.likedByCurrentUser) {
      await api.delete(`/posts/${encodeURIComponent(postId)}/like`);
    } else {
      await api.post(`/posts/${encodeURIComponent(postId)}/like`);
    }
    const next = await getPostByIdMock(postId, viewerId);
    if (!next) return null;
    return { likedByCurrentUser: next.likedByCurrentUser, likesCount: next.likesCount };
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Falha ao atualizar gosto."));
  }
}

export type CreateCommentMockResult =
  | { ok: true; comment: Comment }
  | { ok: false; error: string };

export async function createCommentMock(
  postId: string,
  _viewerId: string,
  content: string,
  parentCommentId?: string | null
): Promise<CreateCommentMockResult> {
  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "Escreva uma mensagem antes de enviar." };
  try {
    const { data } = await api.post(`/posts/${encodeURIComponent(postId)}/comments`, {
      content: trimmed,
      parentCommentId: parentCommentId ?? undefined,
    });
    return { ok: true, comment: mapCommentFromApi(data as Record<string, unknown>) };
  } catch (e) {
    return { ok: false, error: getApiErrorMessage(e, "Não foi possível publicar o comentário.") };
  }
}

export const postCommentsMockApi = {
  listByPostId: getCommentsByPostIdMock,
  listRepliesByParentId: getRepliesByCommentIdMock,
  create: createCommentMock,
} as const;
