import axios, { AxiosHeaders } from "axios";
import {
  clearAuthPersistence,
  dispatchAuthLogoutEvent,
  dispatchAuthRefreshUserEvent,
} from "@/features/auth/authSessionCleanup";
import { ensureFreshAccessToken } from "@/features/auth/authRefresh";
import {
  getStoredRefreshToken,
  getStoredToken,
} from "@/features/auth/authTokenStorage";
import { getApiBaseUrl } from "./apiBaseUrl";
import { showInfoToast } from "./toast";

export {
  getStoredToken,
  setStoredToken,
  getStoredRefreshToken,
  setStoredRefreshToken,
} from "@/features/auth/authTokenStorage";

const baseURL = getApiBaseUrl();

/** Origem da API sem o sufixo `/api` (Kestrel: mesma origem para REST e SignalR). */
export function getApiOrigin(): string {
  return baseURL.replace(/\/api\/?$/, "");
}

/**
 * URLs de mídia vindas da API são frequentemente relativas (`/api/media/videos/...`).
 * No dev (Vite em :5173, API em :5000), `<img src>` / `<video src>` com caminho absoluto na
 * origem errada não carregam — prefixamos com a origem configurada da API.
 */
export function resolvePublicMediaUrl(url: string | null | undefined): string {
  if (url == null) return "";
  const u = url.trim();
  if (!u) return "";
  if (/^(https?:|blob:|data:)/i.test(u)) return u;
  if (u.startsWith("//")) {
    if (typeof window !== "undefined" && window.location?.protocol) {
      return `${window.location.protocol}${u}`;
    }
    return `https:${u}`;
  }
  if (u.startsWith("/")) {
    return `${getApiOrigin()}${u}`;
  }
  return u;
}

/** URL completa do hub SignalR (JWT via query `access_token`). */
export function getDirectMessagesHubUrl(): string {
  return `${getApiOrigin()}/hubs/direct-messages`;
}

export const api = axios.create({
  baseURL,
});

function normalizeRequestPath(url: string | undefined): string {
  if (!url) return "";
  return url.split("?")[0].replace(/^\/+/, "").toLowerCase();
}

/** Não disparar limpeza global em falhas de credenciais no formulário de login/registo. */
function isAuthCredentialsRequest(url: string | undefined): boolean {
  const path = normalizeRequestPath(url);
  return path === "auth/login" || path === "auth/register";
}

api.interceptors.request.use((config) => {
  if (config.url?.startsWith("/")) {
    config.url = config.url.slice(1);
  }

  const t = getStoredToken();
  if (t) {
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (!axios.isAxiosError(err)) return Promise.reject(err);
    const status = err.response?.status;

    if (status === 403) {
      const data = err.response?.data as Record<string, unknown> | undefined;
      if (data?.code === "ACCOUNT_PENDING_VERIFICATION") {
        dispatchAuthRefreshUserEvent();
      }
      return Promise.reject(err);
    }

    if (status !== 401) return Promise.reject(err);
    if (isAuthCredentialsRequest(err.config?.url)) return Promise.reject(err);

    const path = normalizeRequestPath(err.config?.url);
    if (path === "auth/refresh") {
      clearAuthPersistence();
      dispatchAuthLogoutEvent();
      showInfoToast("Sua sessão expirou. Entre novamente para continuar.");
      return Promise.reject(err);
    }

    const cfg = err.config as (import("axios").InternalAxiosRequestConfig & { _woodyAuthRetry?: boolean }) | undefined;
    if (!cfg) return Promise.reject(err);
    if (cfg._woodyAuthRetry) {
      clearAuthPersistence();
      dispatchAuthLogoutEvent();
      showInfoToast("Sua sessão expirou. Entre novamente para continuar.");
      return Promise.reject(err);
    }

    const hadSession = getStoredRefreshToken() != null || getStoredToken() != null;
    if (!hadSession) return Promise.reject(err);

    cfg._woodyAuthRetry = true;
    const ok = await ensureFreshAccessToken();
    if (!ok) {
      clearAuthPersistence();
      dispatchAuthLogoutEvent();
      showInfoToast("Sua sessão expirou. Entre novamente para continuar.");
      return Promise.reject(err);
    }

    const next = getStoredToken();
    const headers = AxiosHeaders.from(cfg.headers ?? {});
    if (next) headers.set("Authorization", `Bearer ${next}`);
    else headers.delete("Authorization");
    cfg.headers = headers;
    return api.request(cfg);
  }
);

/** Extrai texto útil de corpos JSON da API (incl. ProblemDetails do ASP.NET). */
export function getMessageFromApiResponseData(data: unknown): string | null {
  if (data == null || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  if (typeof o.error === "string" && o.error.trim()) return o.error.trim();
  if (typeof o.detail === "string" && o.detail.trim()) return o.detail.trim();
  if (typeof o.message === "string" && o.message.trim()) return o.message.trim();
  if (typeof o.title === "string" && o.title.trim()) {
    const t = o.title.trim();
    if (t !== "Bad Request" && t !== "Not Found" && t !== "Forbidden") return t;
  }
  const errors = o.errors;
  if (errors && typeof errors === "object" && errors !== null) {
    for (const key of Object.keys(errors as Record<string, unknown>)) {
      const arr = (errors as Record<string, unknown[]>)[key];
      if (Array.isArray(arr) && arr[0] != null && typeof arr[0] === "string") return String(arr[0]);
    }
  }
  return null;
}

/** Extrai mensagem de erro de resposta Axios ou genérica. */
export function getApiErrorMessage(err: unknown, fallback = "Algo deu errado."): string {
  if (axios.isAxiosError(err)) {
    const fromBody = getMessageFromApiResponseData(err.response?.data);
    if (fromBody) return fromBody;
    if (err.response?.status === 401) return "Sessão inválida ou credenciais incorretas.";
    if (err.response?.status === 403) return "Sem permissão para esta ação.";
    if (err.response?.status === 404) return "Recurso não encontrado.";
    if (err.response?.status === 400) return "Pedido inválido. Verifica os dados enviados.";
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
