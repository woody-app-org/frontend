import axios from "axios";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { clearAuthPersistence, dispatchAuthLogoutEvent } from "./authSessionCleanup";
import { persistLoginPayload, type AuthLoginApiPayload } from "./authSessionPersist";
import { getStoredRefreshToken } from "./authTokenStorage";

let refreshInFlight: Promise<boolean> | null = null;

/**
 * Renova access + refresh (rotação) usando o refresh token atual.
 * Usa `axios` direto (sem instância `api`) para não reentrar no interceptor de 401.
 * Pedidos concorrentes partilham a mesma Promise (um único POST ao servidor).
 */
export async function ensureFreshAccessToken(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async (): Promise<boolean> => {
      const rt = getStoredRefreshToken();
      if (!rt) return false;

      try {
        const { data } = await axios.post<AuthLoginApiPayload>(
          `${getApiBaseUrl()}/Auth/refresh`,
          { refreshToken: rt },
          { headers: { "Content-Type": "application/json" } }
        );
        persistLoginPayload(data);
        return true;
      } catch {
        clearAuthPersistence();
        dispatchAuthLogoutEvent();
        return false;
      }
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}
