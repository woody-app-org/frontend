import type { User } from "../types";

/** Campos de `User` que a UI denormaliza (posts, listas). */
export type UserDisplayPatch = Partial<Pick<User, "name" | "username" | "avatarUrl" | "bio" | "pronouns">>;

const patchesByUserId = new Map<string, UserDisplayPatch>();

let patchVersion = 0;
const listeners = new Set<() => void>();

function notifyUserPatchListeners(): void {
  patchVersion += 1;
  listeners.forEach((fn) => fn());
}

export function subscribeUserDisplayPatches(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

export function getUserDisplayPatchesVersion(): number {
  return patchVersion;
}

/**
 * Sobrescreve dados de exibição sobre o seed (mock).
 * `getUserById` faz o merge — útil após editar perfil ou hidratar sessão.
 * Futuro: substituir por cache React Query / eventos em tempo real (ex.: WebSocket).
 */
export function applyUserDisplayPatch(userId: string, patch: UserDisplayPatch): void {
  const prev = patchesByUserId.get(userId) ?? {};
  const next = { ...prev };
  for (const [k, v] of Object.entries(patch) as [keyof UserDisplayPatch, UserDisplayPatch[keyof UserDisplayPatch]][]) {
    if (v !== undefined) (next as Record<string, unknown>)[k] = v;
  }
  patchesByUserId.set(userId, next);
  notifyUserPatchListeners();
}

export function getUserDisplayPatch(userId: string): UserDisplayPatch | undefined {
  const p = patchesByUserId.get(userId);
  return p ? { ...p } : undefined;
}

/** Alinha sessão (localStorage) ao mesmo espelho usado em `getUserById`. */
export function syncAuthUserToDisplayPatch(u: {
  id: string;
  username: string;
  name?: string;
  avatarUrl?: string;
}): void {
  const patch: UserDisplayPatch = { name: u.name ?? u.username, username: u.username };
  if (u.avatarUrl !== undefined) {
    patch.avatarUrl = u.avatarUrl || null;
  }
  applyUserDisplayPatch(u.id, patch);
}
