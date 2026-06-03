import type { AuthUserSubscription } from "@/features/subscription/types";
import type {
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  UserRole,
  VerificationStatus,
} from "../types";
import axios from "axios";
import { AUTH_STORAGE_KEY } from "../constants";
import { clearAuthPersistence, dispatchAuthLogoutEvent } from "../authSessionCleanup";
import { syncAuthUserToDisplayPatch } from "@/domain/mocks/userDisplayPatchStore";
import { api, getApiErrorMessage, getStoredRefreshToken, getStoredToken } from "@/lib/api";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { showInfoToast } from "@/lib/toast";
import { ensureFreshAccessToken } from "../authRefresh";
import { mapAuthUser, mapSubscription, normalizeStoredUser } from "../authMapper";
import { persistLoginPayload } from "../authSessionPersist";
import { stripPasswordWhitespace } from "../lib/passwordPolicy";
import { normalizeUsername } from "../lib/usernamePolicy";

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return normalizeStoredUser(JSON.parse(raw) as AuthUser);
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

export async function loginMock(credentials: LoginCredentials): Promise<AuthUser> {
  try {
    const { data } = await api.post<{
      token: string;
      refreshToken: string;
      user: AuthUser;
    }>("/Auth/login", {
      username: normalizeUsername(credentials.username),
      password: stripPasswordWhitespace(credentials.password),
    });
    persistLoginPayload(data);
    const user = mapAuthUser(data.user as Parameters<typeof mapAuthUser>[0]);
    return user;
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Falha no login."));
  }
}

export async function registerMock(credentials: RegisterCredentials): Promise<AuthUser> {
  try {
    const { data } = await api.post<{
      token: string;
      refreshToken: string;
      user: AuthUser;
    }>("/Auth/register", {
      username: normalizeUsername(credentials.username),
      email: credentials.email.trim(),
      password: credentials.password,
      cpf: credentials.cpf.trim(),
      birthDate: credentials.birthDate,
      ...(credentials.avatarUrl ? { avatarUrl: credentials.avatarUrl } : {}),
      ...(credentials.inviteCode?.trim() ? { inviteCode: credentials.inviteCode.trim() } : {}),
    });
    persistLoginPayload(data);
    const user = mapAuthUser(data.user as Parameters<typeof mapAuthUser>[0]);
    return user;
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Falha no registo."));
  }
}

export function logoutMock(): void {
  clearAuthPersistence();
}

export async function logoutSessionMock(): Promise<void> {
  const refreshToken = getStoredRefreshToken();
  const accessToken = getStoredToken();
  try {
    if (refreshToken) {
      await axios.post(
        `${getApiBaseUrl()}/Auth/logout`,
        { refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        }
      );
    }
  } catch {
    /* rede / token expirado: revogar melhor esforço; limpar localmente de qualquer modo */
  }
  logoutMock();
}

export function getAuthUser(): AuthUser | null {
  return getStoredUser();
}

/**
 * Re-hidrata a sessão a partir de `/users/me`, persiste no `localStorage` e sincroniza o
 * display patch. Usar em `AuthContext.refreshUser` para garantir consistência completa.
 */
export async function refreshAuthUserFromMe(): Promise<AuthUser> {
  const user = await fetchAuthUserFromMe();
  setStoredUser(user);
  syncAuthUserToDisplayPatch(user);
  return user;
}

/** Hidrata `AuthUser` a partir de `GET /users/me` (requer JWT válido). */
export async function fetchAuthUserFromMe(): Promise<AuthUser> {
  const { data } = await api.get("/users/me");
  const raw = data as Record<string, unknown>;
  const id = raw.id != null ? String(raw.id) : "";
  if (!id) throw new Error("Resposta inválida de /users/me.");
  const trimOrUndef = (v: unknown): string | undefined => {
    const s = v != null ? String(v).trim() : "";
    return s || undefined;
  };

  const user: AuthUser = {
    id,
    username: raw.username != null ? String(raw.username) : id,
    name: raw.name != null ? String(raw.name) : undefined,
    avatarUrl: raw.avatarUrl != null ? String(raw.avatarUrl) : undefined,
    subscription: mapSubscription(raw.subscription),
    verificationStatus:
      raw.verificationStatus != null
        ? (raw.verificationStatus as VerificationStatus)
        : "PendingDocument",
    role: raw.role != null ? (raw.role as UserRole) : "User",
    // Campos de perfil estendido — mapeados do UserProfileDto já retornado por /users/me.
    bannerUrl: raw.bannerUrl != null ? String(raw.bannerUrl) : null,
    bio: trimOrUndef(raw.bio),
    location: trimOrUndef(raw.location),
    pronouns: trimOrUndef(raw.pronouns),
  };
  return normalizeStoredUser(user);
}

/**
 * Valida sessão ao arranque: sem credenciais limpa cache; com refresh e/ou access confirma com `/users/me`
 * (o interceptor renova o access token automaticamente quando expira).
 */
export async function bootstrapAuthSession(): Promise<AuthUser | null> {
  const access = getStoredToken();
  const refresh = getStoredRefreshToken();
  if (!access && !refresh) {
    clearAuthPersistence();
    return null;
  }

  if (!access && refresh) {
    const renewed = await ensureFreshAccessToken();
    if (!renewed) {
      showInfoToast("Sua sessão expirou. Entre novamente para continuar.");
      return null;
    }
  }

  try {
    const user = await fetchAuthUserFromMe();
    setStoredUser(user);
    syncAuthUserToDisplayPatch(user);
    return user;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 401) {
      if (getStoredToken() || getStoredRefreshToken()) {
        clearAuthPersistence();
        dispatchAuthLogoutEvent();
        showInfoToast("Sua sessão expirou. Entre novamente para continuar.");
      }
    }
    return null;
  }
}

/** Atualiza o estado de assinatura a partir de `GET /users/me` (inclui `subscription` só para a própria utilizadora). */
export async function fetchMySubscriptionState(): Promise<AuthUserSubscription> {
  const { data } = await api.get("/users/me");
  const raw = data as Record<string, unknown>;
  return mapSubscription(raw.subscription);
}

export function patchStoredUser(patch: Partial<AuthUser>): AuthUser | null {
  const cur = getStoredUser();
  if (!cur) return null;
  const next: AuthUser = { ...cur, ...patch };
  setStoredUser(next);
  syncAuthUserToDisplayPatch(next);
  return next;
}
