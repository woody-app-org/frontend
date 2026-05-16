import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";

/**
 * Redireciona / para /feed (se autenticado) ou /auth (se não).
 */
export function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[var(--auth-bg)]"
        aria-live="polite"
        aria-busy="true"
      >
        <p className="text-[var(--auth-ornament)]">Carregando...</p>
      </div>
    );
  }

  return (
    <Navigate to={isAuthenticated ? "/feed" : "/auth"} replace />
  );
}
