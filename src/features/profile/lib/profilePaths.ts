/** Parâmetro numérico legado (`/profile/42`) — redirecionar para username quando possível. */
export function isLegacyNumericProfileParam(value: string | undefined): boolean {
  return typeof value === "string" && /^\d+$/.test(value);
}

export function profilePath(usernameOrId: string): string {
  return `/profile/${encodeURIComponent(usernameOrId)}`;
}

export function profilePathForUser(user: { username?: string | null; id: string | number }): string {
  const id = String(user.id);
  const username = user.username?.trim();
  if (username) return profilePath(username);
  return profilePath(id);
}

export function profileSignalsPath(user: { username?: string | null; id: string | number }): string {
  return `${profilePathForUser(user)}?tab=signals`;
}

/** Segmento após `/profile/` na rota atual (sem query/hash). */
export function profileRouteParamFromPathname(pathname: string): string | null {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const prefix = "/profile/";
  if (!normalized.startsWith(prefix)) return null;
  const param = normalized.slice(prefix.length);
  if (!param || param.includes("/")) return null;
  try {
    return decodeURIComponent(param);
  } catch {
    return param;
  }
}

/** Verdadeiro quando `pathname` é a página de perfil da utilizadora autenticada. */
export function isOwnProfileRoute(
  pathname: string,
  user: { id: string | number; username?: string | null }
): boolean {
  const param = profileRouteParamFromPathname(pathname);
  if (!param) return false;
  if (param === String(user.id)) return true;
  const username = user.username?.trim();
  if (!username) return false;
  return param.localeCompare(username, undefined, { sensitivity: "base" }) === 0;
}
