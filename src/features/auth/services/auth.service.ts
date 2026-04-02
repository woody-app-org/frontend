import type { AuthUser, LoginCredentials, RegisterCredentials } from "../types";
import { AUTH_STORAGE_KEY, AUTH_TOKEN_KEY } from "../constants";
import { syncAuthUserToDisplayPatch } from "@/domain/mocks/userDisplayPatchStore";
import { api, getApiErrorMessage, setStoredToken } from "@/lib/api";

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

function mapAuthUser(raw: { id: string; username: string; email?: string; name?: string; avatarUrl?: string }): AuthUser {
  return {
    id: String(raw.id),
    username: raw.username,
    email: raw.email,
    name: raw.name ?? raw.username,
    avatarUrl: raw.avatarUrl,
  };
}

export async function loginMock(credentials: LoginCredentials): Promise<AuthUser> {
  try {
    const { data } = await api.post<{ token: string; user: AuthUser }>("/Auth/login", {
      username: credentials.username.trim(),
      password: credentials.password,
    });
    setStoredToken(data.token);
    const user = mapAuthUser(data.user as AuthUser);
    setStoredUser(user);
    syncAuthUserToDisplayPatch(user);
    return user;
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Falha no login."));
  }
}

export async function registerMock(credentials: RegisterCredentials): Promise<AuthUser> {
  try {
    const { data } = await api.post<{ token: string; user: AuthUser }>("/Auth/register", {
      username: credentials.username.trim(),
      email: credentials.email.trim(),
      password: credentials.password,
      cpf: credentials.cpf.trim(),
      birthDate: credentials.birthDate,
      avatarUrl: credentials.avatarUrl ?? undefined,
    });
    setStoredToken(data.token);
    const user = mapAuthUser(data.user as AuthUser);
    setStoredUser(user);
    syncAuthUserToDisplayPatch(user);
    return user;
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Falha no registo."));
  }
}

export function logoutMock(): void {
  setStoredUser(null);
  setStoredToken(null);
}

export async function logoutSessionMock(): Promise<void> {
  const t = localStorage.getItem(AUTH_TOKEN_KEY);
  if (t) {
    try {
      await api.post("/Auth/logout");
    } catch {
      /* stateless JWT: ignorar */
    }
  }
  logoutMock();
}

export function getAuthUser(): AuthUser | null {
  return getStoredUser();
}

export function patchStoredUser(patch: Partial<AuthUser>): AuthUser | null {
  const cur = getStoredUser();
  if (!cur) return null;
  const next: AuthUser = { ...cur, ...patch };
  setStoredUser(next);
  syncAuthUserToDisplayPatch(next);
  return next;
}
