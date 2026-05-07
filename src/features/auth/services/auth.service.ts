import type { AuthUserSubscription } from "@/features/subscription/types";
import type { AuthUser, LoginCredentials, RegisterCredentials } from "../types";
import { AUTH_STORAGE_KEY } from "../constants";
import { clearAuthPersistence } from "../authSessionCleanup";
import { syncAuthUserToDisplayPatch } from "@/domain/mocks/userDisplayPatchStore";
import { api, getApiErrorMessage, getStoredToken, setStoredToken } from "@/lib/api";

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

const defaultSubscription = (): AuthUserSubscription => ({
  effectivePlan: "free",
  billingPlan: "free",
  planCode: "free",
  status: "active",
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  showProBadge: false,
  canOpenBillingPortal: false,
});

export function mapSubscription(raw: unknown): AuthUserSubscription {
  if (!raw || typeof raw !== "object") return defaultSubscription();
  const o = raw as Record<string, unknown>;
  return {
    effectivePlan: o.effectivePlan === "pro" ? "pro" : "free",
    billingPlan:
      o.billingPlan === "max" ? "max" : o.billingPlan === "pro" ? "pro" : "free",
    planCode: o.planCode != null ? String(o.planCode) : null,
    status: typeof o.status === "string" ? o.status : "active",
    currentPeriodEnd: o.currentPeriodEnd != null ? String(o.currentPeriodEnd) : null,
    cancelAtPeriodEnd: Boolean(o.cancelAtPeriodEnd),
    showProBadge: Boolean(o.showProBadge),
    canOpenBillingPortal: Boolean(o.canOpenBillingPortal),
  };
}

function mapAuthUser(raw: {
  id: string;
  username: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  subscription?: unknown;
}): AuthUser {
  return {
    id: String(raw.id),
    username: raw.username,
    email: raw.email,
    name: raw.name ?? raw.username,
    avatarUrl: raw.avatarUrl,
    subscription: mapSubscription(raw.subscription),
  };
}

function normalizeStoredUser(u: AuthUser): AuthUser {
  if (u.subscription) return u;
  return { ...u, subscription: defaultSubscription() };
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
      ...(credentials.avatarUrl ? { avatarUrl: credentials.avatarUrl } : {}),
      ...(credentials.inviteCode?.trim() ? { inviteCode: credentials.inviteCode.trim() } : {}),
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
  clearAuthPersistence();
}

export async function logoutSessionMock(): Promise<void> {
  const t = getStoredToken();
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

/** Hidrata `AuthUser` a partir de `GET /users/me` (requer JWT válido). */
export async function fetchAuthUserFromMe(): Promise<AuthUser> {
  const { data } = await api.get("/users/me");
  const raw = data as Record<string, unknown>;
  const id = raw.id != null ? String(raw.id) : "";
  if (!id) throw new Error("Resposta inválida de /users/me.");
  const user: AuthUser = {
    id,
    username: raw.username != null ? String(raw.username) : id,
    name: raw.name != null ? String(raw.name) : undefined,
    avatarUrl: raw.avatarUrl != null ? String(raw.avatarUrl) : undefined,
    subscription: mapSubscription(raw.subscription),
  };
  return normalizeStoredUser(user);
}

/**
 * Valida sessão ao arranque: sem token limpa cache antigo; com token confirma com `/users/me`.
 */
export async function bootstrapAuthSession(): Promise<AuthUser | null> {
  const token = getStoredToken();
  if (!token) {
    clearAuthPersistence();
    return null;
  }
  try {
    const user = await fetchAuthUserFromMe();
    setStoredUser(user);
    syncAuthUserToDisplayPatch(user);
    return user;
  } catch {
    clearAuthPersistence();
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
