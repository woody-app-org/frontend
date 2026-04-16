import type { AuthUserSubscription } from "@/features/subscription/types";
import type { AuthUser, LoginCredentials, RegisterCredentials } from "../types";
import { AUTH_STORAGE_KEY, AUTH_TOKEN_KEY } from "../constants";
import { syncAuthUserToDisplayPatch } from "@/domain/mocks/userDisplayPatchStore";
import { api, getApiErrorMessage, setStoredToken } from "@/lib/api";

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
  status: "active",
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  showProBadge: false,
});

function mapSubscription(raw: unknown): AuthUserSubscription {
  if (!raw || typeof raw !== "object") return defaultSubscription();
  const o = raw as Record<string, unknown>;
  return {
    effectivePlan: o.effectivePlan === "pro" ? "pro" : "free",
    billingPlan: o.billingPlan === "pro" ? "pro" : "free",
    status: typeof o.status === "string" ? o.status : "active",
    currentPeriodEnd: o.currentPeriodEnd != null ? String(o.currentPeriodEnd) : null,
    cancelAtPeriodEnd: Boolean(o.cancelAtPeriodEnd),
    showProBadge: Boolean(o.showProBadge),
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
