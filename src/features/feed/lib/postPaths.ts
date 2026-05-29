/** Parâmetro numérico legado (`/posts/123`) — redirecionar para publicId quando possível. */
export function isLegacyNumericPostParam(value: string | undefined): boolean {
  return typeof value === "string" && /^\d+$/.test(value);
}

export function postPath(publicId: string): string {
  return `/posts/${encodeURIComponent(publicId)}`;
}

/** URL absoluta para partilhar (copiar link / Web Share API). */
export function absolutePostUrl(publicId: string): string {
  const id = publicId.trim();
  if (typeof window === "undefined") return postPath(id);
  return `${window.location.origin}${postPath(id)}`;
}

/** Alias explícito para partilha — sempre usa `publicId`, nunca id incremental. */
export const buildPostShareUrl = absolutePostUrl;

export function absolutePostUrlForPost(post: { publicId?: string | null; id: string }): string {
  const publicId = post.publicId?.trim();
  if (publicId) return absolutePostUrl(publicId);
  return absolutePostUrl(post.id);
}

export function postPathForPost(post: { publicId?: string | null; id: string }): string {
  const publicId = post.publicId?.trim();
  if (publicId) return postPath(publicId);
  return postPath(post.id);
}

export function postCommentsFocusPath(
  post: { publicId?: string | null; id: string },
  commentId?: string | number | null
): string {
  const q = new URLSearchParams();
  q.set("focus", "comments");
  const base = `${postPathForPost(post)}?${q.toString()}`;
  if (commentId == null || commentId === "") return base;
  return `${base}#comment-${commentId}`;
}
