import axios from "axios";
import { AUTH_TOKEN_KEY } from "@/features/auth/constants";

/**
 * Base da API: sempre termina em `/api` (prefixo dos controllers ASP.NET).
 * Se `VITE_API_BASE_URL` for só o host (ex. Railway sem `/api`), acrescenta `/api`.
 *
 * Em `vite` com modo development, o default é HTTP na porta do Kestrel (5000) para evitar
 * pedidos HTTPS com certificado de dev não confiável a partir de http://localhost:5173.
 */
function resolveApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.toString().trim();
  if (raw) {
    const noTrail = raw.replace(/\/+$/, "");
    if (noTrail.endsWith("/api")) return noTrail;
    return `${noTrail}/api`;
  }
  if (import.meta.env.DEV) {
    return "http://localhost:5000/api";
  }
  throw new Error(
    "VITE_API_BASE_URL não definido. Configure no painel de deploy (build) ou em .env.production."
  );
}

const baseURL = resolveApiBaseUrl();

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

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  else localStorage.removeItem(AUTH_TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  // Caminhos com "/" inicial são tratados como absolutos à raiz do host e removem o `/api` do baseURL.
  // Usar caminhos relativos ao baseURL garante `.../api/Auth/login`, `.../api/posts/...`, etc.
  if (config.url?.startsWith("/")) {
    config.url = config.url.slice(1);
  }

  const t = getStoredToken();
  if (t) {
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

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
