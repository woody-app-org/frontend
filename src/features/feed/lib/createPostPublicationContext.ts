import type { Community } from "@/domain/types";

/** Destino da publicação ao abrir o modal (sempre contextual; sem modo "manual" no modal). */
export type CreatePostModalPublication =
  | { kind: "profile" }
  | { kind: "community"; community: Community };

function normalizePath(pathname: string): string {
  const base = pathname.split("?")[0] || "/";
  if (base.length > 1 && base.endsWith("/")) return base.slice(0, -1);
  return base;
}

export interface ResolveCreatePostPublicationOptions {
  pageComposerCommunity: Community | null;
  viewerUserId: string | undefined;
}

/**
 * Deriva o destino da criação a partir da rota e do estado já sincronizado (ex.: comunidade visitada).
 */
export function resolveCreatePostPublicationFromRoute(
  pathname: string,
  opts: ResolveCreatePostPublicationOptions
): CreatePostModalPublication {
  const p = normalizePath(pathname);

  const communityDetailMatch = /^\/communities\/([^/]+)$/.exec(p);
  if (communityDetailMatch && communityDetailMatch[1] !== "nova" && opts.pageComposerCommunity) {
    return { kind: "community", community: opts.pageComposerCommunity };
  }

  return { kind: "profile" };
}

export interface ShouldShowFloatingCreatePostOptions {
  viewerUserId: string | undefined;
}

/**
 * Indica se o FAB de criar publicação deve aparecer (rotas protegidas com FeedLayout).
 */
export function shouldShowFloatingCreatePost(
  pathname: string,
  opts: ShouldShowFloatingCreatePostOptions
): boolean {
  if (!opts.viewerUserId) return false;

  const p = normalizePath(pathname);

  if (p === "/criar") return false;
  if (p.startsWith("/messages")) return false;
  if (p.startsWith("/planos")) return false;
  if (p.startsWith("/posts/")) return false;
  if (p === "/communities/nova") return false;
  if (/^\/communities\/[^/]+\/admin$/.test(p)) return false;
  if (p.startsWith("/assinatura/")) return false;

  const profileMatch = /^\/profile\/([^/]+)$/.exec(p);
  if (profileMatch) return profileMatch[1] === opts.viewerUserId;

  if (p === "/feed") return true;
  if (p === "/communities") return true;

  if (communityDetailMatch(p)) return true;

  return false;
}

function communityDetailMatch(p: string): boolean {
  return /^\/communities\/[^/]+$/.test(p) && p !== "/communities/nova";
}
