import { removeUserDisplayPatch } from "@/domain/mocks/userDisplayPatchStore";
import { AUTH_REFRESH_TOKEN_KEY, AUTH_STORAGE_KEY, AUTH_TOKEN_KEY } from "./constants";

/** O AuthContext escuta isto para `setUser(null)` após limpeza no client HTTP (ex.: 401). */
export const WOODY_AUTH_LOGOUT_EVENT = "woody:auth:logout";

/** Outra aba (ou o mesmo documento) atualizou tokens / snapshot de utilizador em `localStorage`. */
export const WOODY_AUTH_SESSION_PERSISTED_EVENT = "woody:auth:session-persisted";

export function dispatchAuthSessionPersistedEvent(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(WOODY_AUTH_SESSION_PERSISTED_EVENT));
}

/** Sinaliza que o status de verificação pode estar desatualizado; AuthContext re-hidrata sessão. */
export const WOODY_AUTH_REFRESH_USER_EVENT = "woody:auth:refresh-user";

export function dispatchAuthRefreshUserEvent(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(WOODY_AUTH_REFRESH_USER_EVENT));
}

export function dispatchAuthLogoutEvent(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(WOODY_AUTH_LOGOUT_EVENT));
}

/**
 * Limpa token, snapshot de utilizador e patch visual associado.
 * Não chama a API (adequado para interceptor e sessão inválida).
 */
export function clearAuthPersistence(): void {
  let userId: string | null = null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as { id?: unknown };
      if (p?.id != null && String(p.id).length > 0) userId = String(p.id);
    }
  } catch {
    /* vazio ou JSON inválido */
  }
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    /* storage indisponível */
  }
  if (userId) removeUserDisplayPatch(userId);
}
