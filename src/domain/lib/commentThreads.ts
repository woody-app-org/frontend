/**
 * Helpers puros para threads de comentários (pai/filho via `parentCommentId`).
 * TODO(backend): mesma modelagem em API; substituir fonte de dados, manter assinaturas.
 */
import type { Comment } from "../types";

/** Identificação mínima para particionar raízes/respostas. */
export interface CommentParentRef {
  id: string;
  postId: string;
  parentCommentId: string | null;
  createdAt: string;
  /** Quando presente, comentários fixos pela autora do post vêm primeiro (alinhado à API). */
  pinnedOnPostAt?: string | null;
}

export function getRootCommentsByPostId<T extends CommentParentRef>(postId: string, comments: readonly T[]): T[] {
  return comments
    .filter((c) => c.postId === postId && c.parentCommentId == null)
    .sort((a, b) => {
      const ap = a.pinnedOnPostAt ? 1 : 0;
      const bp = b.pinnedOnPostAt ? 1 : 0;
      if (ap !== bp) return bp - ap;
      return a.createdAt.localeCompare(b.createdAt);
    });
}

export function getRepliesByCommentId<T extends CommentParentRef>(parentId: string, comments: readonly T[]): T[] {
  return comments
    .filter((c) => c.parentCommentId === parentId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export interface CommentThreadNode {
  comment: Comment;
  replies: CommentThreadNode[];
}

/**
 * Monta árvore de comentários para um post (raízes ordenadas; filhos ordenados por data).
 */
export function buildCommentThreadTree(postId: string, comments: readonly Comment[]): CommentThreadNode[] {
  const forPost = comments.filter((c) => c.postId === postId);
  const childMap = new Map<string | null, Comment[]>();

  for (const c of forPost) {
    const key = c.parentCommentId;
    const bucket = childMap.get(key) ?? [];
    bucket.push(c);
    childMap.set(key, bucket);
  }

  for (const [, list] of childMap) {
    list.sort((a, b) => {
      const ap = a.pinnedOnPostAt ? 1 : 0;
      const bp = b.pinnedOnPostAt ? 1 : 0;
      if (ap !== bp) return bp - ap;
      return a.createdAt.localeCompare(b.createdAt);
    });
  }

  function nodeFor(comment: Comment): CommentThreadNode {
    const replies = (childMap.get(comment.id) ?? []).map(nodeFor);
    return { comment, replies };
  }

  const roots = childMap.get(null) ?? [];
  return roots.map(nodeFor);
}
