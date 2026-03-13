import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protege rotas que exigem autenticação. Redireciona para /auth se não autenticado.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[var(--woody-bg)]"
        aria-live="polite"
        aria-busy="true"
      >
        <p className="text-[var(--woody-muted)]">Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
