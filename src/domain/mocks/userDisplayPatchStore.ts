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
  let changed = false;
  for (const [k, v] of Object.entries(patch) as [keyof UserDisplayPatch, UserDisplayPatch[keyof UserDisplayPatch]][]) {
    if (v !== undefined && prev[k as keyof UserDisplayPatch] !== v) {
      (next as Record<string, unknown>)[k] = v;
      changed = true;
    }
  }
  // Só notifica se algo mudou de facto — evita incrementar patchVersion
  // em cada bootstrap de sessão quando os dados são idênticos ao que já está guardado.
  if (!changed) return;
  patchesByUserId.set(userId, next);
  notifyUserPatchListeners();
}

export function getUserDisplayPatch(userId: string): UserDisplayPatch | undefined {
  const p = patchesByUserId.get(userId);
  return p ? { ...p } : undefined;
}

/** Remove overrides de exibição para esta utilizadora (logout / sessão inválida). */
export function removeUserDisplayPatch(userId: string): void {
  if (!patchesByUserId.delete(userId)) return;
  notifyUserPatchListeners();
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
