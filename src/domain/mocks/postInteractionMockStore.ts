/**
 * Estado mutável de posts, comentários e curtidas (mock local).
 *
 * TODO(backend): substituir por cache (React Query / servidor) e invalidação por mutações HTTP.
 * Os serviços em `postMock.service.ts` devem delegar para API mantendo os mesmos contratos públicos.
 */
import { resetContentReportMockStore } from "./contentReportMockStore";
import type { SeedComment, SeedPost } from "./seed";
import { SEED_POST_COMMENTS, SEED_POSTS, SEED_USERS } from "./seed";

let postRows: SeedPost[] | null = null;
let commentRows: SeedComment[] | null = null;
/** userId -> ids de posts que essa usuária curtiu */
const likedPostsByUser = new Map<string, Set<string>>();

let interactionVersion = 0;
const listeners = new Set<() => void>();

function notify(): void {
  interactionVersion += 1;
  listeners.forEach((fn) => fn());
}

export function subscribePostInteractions(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

export function getPostInteractionsVersion(): number {
  return interactionVersion;
}

function clonePost(p: SeedPost): SeedPost {
  return {
    ...p,
    author: { ...p.author },
    tags: p.tags ? [...p.tags] : undefined,
    updatedAt: p.updatedAt,
    deletedAt: p.deletedAt,
  };
}

function cloneComment(c: SeedComment): SeedComment {
  return {
    ...c,
    deletedAt: c.deletedAt,
    hiddenByPostAuthorAt: c.hiddenByPostAuthorAt,
  };
}

function initLikedPosts(): void {
  if (likedPostsByUser.size > 0) return;
  const rows = postRows ?? SEED_POSTS.map(clonePost);
  if (!postRows) postRows = rows;

  for (const u of SEED_USERS) {
    const set = new Set<string>();
    for (const p of rows) {
      const n = Number(u.id) + p.id.length * 17 + (p.likesCount % 97);
      if (n % 8 < 2) set.add(p.id);
    }
    likedPostsByUser.set(u.id, set);
  }
}

export function getMutablePostRows(): SeedPost[] {
  if (!postRows) {
    postRows = SEED_POSTS.map(clonePost);
  }
  initLikedPosts();
  return postRows;
}

export function getMutableCommentRows(): SeedComment[] {
  if (!commentRows) {
    commentRows = SEED_POST_COMMENTS.map(cloneComment);
  }
  getMutablePostRows();
  return commentRows;
}

export function isPostLikedByUser(userId: string, postId: string): boolean {
  getMutablePostRows();
  return likedPostsByUser.get(userId)?.has(postId) ?? false;
}

export function togglePostLikeForUser(userId: string, postId: string): {
  likedByCurrentUser: boolean;
  likesCount: number;
} | null {
  const rows = getMutablePostRows();
  const post = rows.find((p) => p.id === postId);
  if (!post) return null;

  let set = likedPostsByUser.get(userId);
  if (!set) {
    set = new Set();
    likedPostsByUser.set(userId, set);
  }

  if (set.has(postId)) {
    set.delete(postId);
    post.likesCount = Math.max(0, post.likesCount - 1);
    notify();
    return { likedByCurrentUser: false, likesCount: post.likesCount };
  }

  set.add(postId);
  post.likesCount += 1;
  notify();
  return { likedByCurrentUser: true, likesCount: post.likesCount };
}

export function appendCommentForPost(input: {
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  /** `undefined`/`null` = comentário raiz. */
  parentCommentId?: string | null;
}): SeedComment | null {
  const rows = getMutablePostRows();
  const post = rows.find((p) => p.id === input.postId);
  if (!post) return null;

  const comments = getMutableCommentRows();
  const parentCommentId = input.parentCommentId ?? null;
  if (parentCommentId != null) {
    const parent = comments.find((c) => c.id === parentCommentId);
    if (!parent || parent.postId !== input.postId) return null;
  }

  const nextNum = comments.filter((c) => c.postId === input.postId).length + 1;
  const row: SeedComment = {
    id: `cmt-${input.postId}-local-${nextNum}-${Date.now()}`,
    postId: input.postId,
    parentCommentId,
    authorId: input.authorId,
    content: input.content,
    createdAt: input.createdAt,
  };
  comments.push(row);
  post.commentsCount += 1;
  notify();
  return row;
}

export function getSeedPostRowById(postId: string): SeedPost | undefined {
  return getMutablePostRows().find((p) => p.id === postId);
}

export function getSeedCommentRowById(commentId: string): SeedComment | undefined {
  return getMutableCommentRows().find((c) => c.id === commentId);
}

function isPostActiveRow(p: SeedPost): boolean {
  return p.deletedAt == null || p.deletedAt === "";
}

/**
 * Atualiza título/corpo pelo autor. `viewerId` deve ser a autora do post.
 * @returns post enriquecível via `enrichPost` ou `null` se inválido.
 */
export function updatePostRowForAuthor(
  viewerId: string,
  postId: string,
  patch: { title: string; content: string }
): SeedPost | null {
  const rows = getMutablePostRows();
  const post = rows.find((p) => p.id === postId);
  if (!post || !isPostActiveRow(post)) return null;
  if (post.authorId !== viewerId) return null;
  const title = patch.title.trim();
  const content = patch.content.trim();
  if (!title || !content) return null;
  post.title = title;
  post.content = content;
  post.updatedAt = new Date().toISOString();
  notify();
  return post;
}

/** Soft-delete pelo autor. */
export function softDeletePostRowForAuthor(viewerId: string, postId: string): boolean {
  const rows = getMutablePostRows();
  const post = rows.find((p) => p.id === postId);
  if (!post || !isPostActiveRow(post)) return false;
  if (post.authorId !== viewerId) return false;
  post.deletedAt = new Date().toISOString();
  notify();
  return true;
}

function isCommentActiveRow(c: SeedComment): boolean {
  return c.deletedAt == null || c.deletedAt === "";
}

/** Soft-delete pelo autor do comentário; ajusta `commentsCount` do post. */
export function softDeleteCommentRowForAuthor(viewerId: string, commentId: string): boolean {
  const comments = getMutableCommentRows();
  const comment = comments.find((c) => c.id === commentId);
  if (!comment || !isCommentActiveRow(comment)) return false;
  if (comment.authorId !== viewerId) return false;

  const rows = getMutablePostRows();
  const post = rows.find((p) => p.id === comment.postId);
  if (!post) return false;

  comment.deletedAt = new Date().toISOString();
  post.commentsCount = Math.max(0, post.commentsCount - 1);
  notify();
  return true;
}

/**
 * Autora do post oculta comentário de terceira. Não altera `commentsCount`
 * (comentário permanece no thread com máscara para leitoras).
 */
export function hideCommentRowForPostAuthor(viewerId: string, commentId: string): boolean {
  const comments = getMutableCommentRows();
  const comment = comments.find((c) => c.id === commentId);
  if (!comment || !isCommentActiveRow(comment)) return false;
  if (comment.hiddenByPostAuthorAt) return false;

  const rows = getMutablePostRows();
  const post = rows.find((p) => p.id === comment.postId);
  if (!post || !isPostActiveRow(post)) return false;
  if (post.authorId !== viewerId) return false;
  if (comment.authorId === viewerId) return false;

  comment.hiddenByPostAuthorAt = new Date().toISOString();
  notify();
  return true;
}

/** Apenas para testes ou reset de sessão. */
export function resetPostInteractionMockStore(): void {
  postRows = null;
  commentRows = null;
  likedPostsByUser.clear();
  interactionVersion = 0;
  resetContentReportMockStore();
}
