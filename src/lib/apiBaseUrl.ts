/**
 * Base da API: sempre termina em `/api` (prefixo dos controllers ASP.NET).
 * Partilhado entre `api.ts` e renovação de sessão (evita dependência circular).
 */
export function getApiBaseUrl(): string {
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
