import type { AuthUser, LoginCredentials, RegisterCredentials } from "../types";
import { AUTH_STORAGE_KEY } from "../constants";

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
  return user;
}

export function logoutMock(): void {
  setStoredUser(null);
}

export function getAuthUser(): AuthUser | null {
  return getStoredUser();
}
