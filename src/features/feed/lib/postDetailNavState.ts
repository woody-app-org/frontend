import type { Location } from "react-router-dom";

/** Guardado em `location.state` ao navegar para `/posts/:id` a partir de outras rotas da app. */
export type PostDetailNavState = {
  /** Path interno de origem: `pathname` + `search` + `hash` (ex.: `/profile/3?tab=posts`). */
  from: string;
};

export function buildPostDetailNavState(
  loc: Pick<Location, "pathname" | "search" | "hash">
): PostDetailNavState {
  return {
    from: `${loc.pathname}${loc.search}${loc.hash ?? ""}`,
  };
}

function readFromState(state: unknown): string | undefined {
  const raw = (state as PostDetailNavState | null)?.from;
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) return undefined;
  return raw;
}

/** Destino do botão “Voltar” no detalhe do post. */
export function resolvePostDetailBackTarget(
  current: Pick<Location, "pathname" | "search" | "hash">,
  state: unknown
): { kind: "path"; path: string } | { kind: "historyBack" } {
  const from = readFromState(state);
  const here = `${current.pathname}${current.search}${current.hash ?? ""}`;
  if (from != null && from !== here) {
    return { kind: "path", path: from };
  }
  return { kind: "historyBack" };
}

/**
 * Após excluir o post no detalhe, navegar para a página de origem (sem fragmento),
 * ou `/feed` se não houver estado.
 */
export function postDetailDeleteRedirectFromState(state: unknown, fallback = "/feed"): string {
  const from = readFromState(state);
  if (!from) return fallback;
  return from.split("#")[0] || fallback;
}

/** `true` se o destino for um detalhe de post (pathname `/posts/:id`). */
export function routeTargetsPostDetail(route: string): boolean {
  const pathname = route.split("?")[0].split("#")[0];
  return /^\/posts\/[^/]+$/.test(pathname);
}
