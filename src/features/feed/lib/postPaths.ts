/** Parâmetro numérico legado (`/posts/123`) — redirecionar para publicId quando possível. */
export function isLegacyNumericPostParam(value: string | undefined): boolean {
  return typeof value === "string" && /^\d+$/.test(value);
}

export function postPath(publicId: string): string {
  return `/posts/${encodeURIComponent(publicId)}`;
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
