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
