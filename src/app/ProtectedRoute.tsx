import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { SessionBootstrapSplash } from "@/features/auth/components/SessionBootstrapSplash";
import { isBetaClosed } from "@/config/beta";

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
    return <SessionBootstrapSplash />;
  }

  if (!isAuthenticated) {
    const loginTarget = isBetaClosed() ? "/auth/login" : "/auth";
    return <Navigate to={loginTarget} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
