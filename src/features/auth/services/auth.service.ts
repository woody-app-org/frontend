import type { AuthUser, LoginCredentials, RegisterCredentials } from "../types";
import { AUTH_STORAGE_KEY } from "../constants";
import { syncAuthUserToDisplayPatch } from "@/domain/mocks/userDisplayPatchStore";

const MOCK_DELAY_MS = 600;

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function setStoredUser(user: AuthUser | null): void {
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

/** Simula login. Qualquer usuário/senha com senha >= 6 chars é aceito no mock. */
export async function loginMock(
  credentials: LoginCredentials
): Promise<AuthUser> {
  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
  const user: AuthUser = {
    id: "1",
    username: credentials.username.trim(),
    name: credentials.username.trim(),
    email: credentials.username.includes("@") ? credentials.username : undefined,
  };
  setStoredUser(user);
  syncAuthUserToDisplayPatch(user);
  return user;
}

/** Simula cadastro. Sempre retorna sucesso no mock. */
export async function registerMock(
  credentials: RegisterCredentials
): Promise<AuthUser> {
  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
  const user: AuthUser = {
    id: crypto.randomUUID(),
    username: credentials.username.trim(),
    email: credentials.email.trim(),
    name: credentials.username.trim(),
    avatarUrl: credentials.avatarUrl ?? undefined,
  };
  setStoredUser(user);
  syncAuthUserToDisplayPatch(user);
  return user;
}

export function logoutMock(): void {
  setStoredUser(null);
}

/**
 * Encerra sessão com latência semelhante à API (revogação de token, etc.).
 * A UI pode continuar usando `logoutMock` síncrono via `AuthContext`; use este quando o fluxo for assíncrono.
 */
/** Simula POST /auth/logout — ver `BACKEND_ROUTE_HINTS.session` em `src/lib/backendIntegrationHints.ts`. */
export async function logoutSessionMock(): Promise<void> {
  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
  logoutMock();
}

export function getAuthUser(): AuthUser | null {
  return getStoredUser();
}

/** Mescla campos no usuário persistido (ex.: após editar perfil). */
export function patchStoredUser(patch: Partial<AuthUser>): AuthUser | null {
  const cur = getStoredUser();
  if (!cur) return null;
  const next: AuthUser = { ...cur, ...patch };
  setStoredUser(next);
  syncAuthUserToDisplayPatch(next);
  return next;
}
