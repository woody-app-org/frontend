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

/** Extrai mensagem de erro de resposta Axios ou genérica. */
export function getApiErrorMessage(err: unknown, fallback = "Algo deu errado."): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string; message?: string } | undefined;
    if (data?.error && typeof data.error === "string") return data.error;
    if (data?.message && typeof data.message === "string") return data.message;
    if (err.response?.status === 401) return "Sessão inválida ou credenciais incorretas.";
    if (err.response?.status === 403) return "Sem permissão para esta ação.";
    if (err.response?.status === 404) return "Recurso não encontrado.";
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
