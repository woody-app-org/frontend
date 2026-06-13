import { AUTH_REFRESH_TOKEN_KEY, AUTH_TOKEN_KEY } from "./constants";

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
    else localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    /* storage indisponível */
  }
}

export function getStoredRefreshToken(): string | null {
  try {
    return localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredRefreshToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, token);
    else localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
  } catch {
    /* storage indisponível */
  }
}

/** Lê o claim `exp` (segundos epoch) de um JWT, sem validar assinatura. */
function getTokenExpiryMs(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const { exp } = JSON.parse(json) as { exp?: number };
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Considera o access token expirado se faltar menos que `skewMs` para o `exp`.
 * Endpoints `[AllowAnonymous]` (ex.: GET de comentários) não respondem 401 com
 * token expirado — apenas tratam o pedido como anónimo, ocultando "curtido por mim"
 * sem disparar o refresh reativo. Por isso o token é renovado antes do envio.
 */
export function isTokenExpired(token: string, skewMs = 5000): boolean {
  const expMs = getTokenExpiryMs(token);
  if (expMs == null) return false;
  return Date.now() >= expMs - skewMs;
}
