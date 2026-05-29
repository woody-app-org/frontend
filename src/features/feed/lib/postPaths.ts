/** Parâmetro numérico legado (`/posts/123`) — redirecionar para publicId quando possível. */
export function isLegacyNumericPostParam(value: string | undefined): boolean {
  return typeof value === "string" && /^\d+$/.test(value);
}

export function postPath(publicId: string): string {
  return `/posts/${encodeURIComponent(publicId)}`;
}

/** Origem pública da API para URLs de share OG (sem sufixo `/api`). */
export function getPublicShareBaseUrl(): string {
  const explicit = import.meta.env.VITE_PUBLIC_SHARE_BASE_URL?.toString().trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const api = import.meta.env.VITE_API_BASE_URL?.toString().trim();
  if (api) {
    const noTrail = api.replace(/\/+$/, "");
    if (noTrail.endsWith("/api")) return noTrail.slice(0, -4);
    return noTrail;
  }

  if (import.meta.env.DEV) return "http://localhost:5000";

  throw new Error(
    "VITE_PUBLIC_SHARE_BASE_URL ou VITE_API_BASE_URL deve estar definido para partilha externa."
  );
}

/** URL absoluta interna do frontend (`/posts/{publicId}`). */
export function buildPostInternalUrl(publicId: string): string {
  const id = publicId.trim();
  if (typeof window === "undefined") return postPath(id);
  return `${window.location.origin}${postPath(id)}`;
}

/** URL absoluta externa com Open Graph server-side (`/share/posts/{publicId}`). */
export function buildPostExternalShareUrl(publicId: string): string {
  const id = publicId.trim();
  return `${getPublicShareBaseUrl()}/share/posts/${encodeURIComponent(id)}`;
}

/** URL absoluta para partilhar (copiar link / Web Share API) — usa endpoint OG. */
export function absolutePostUrl(publicId: string): string {
  return buildPostExternalShareUrl(publicId);
}

/** Alias explícito para partilha externa. */
export const buildPostShareUrl = buildPostExternalShareUrl;

export function absolutePostUrlForPost(post: { publicId?: string | null; id: string }): string {
  const publicId = post.publicId?.trim();
  if (publicId) return buildPostExternalShareUrl(publicId);
  return buildPostExternalShareUrl(post.id);
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
