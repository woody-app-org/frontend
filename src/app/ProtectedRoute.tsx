import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { SessionBootstrapSplash } from "@/features/auth/components/SessionBootstrapSplash";
import { isBetaClosed } from "@/config/beta";
import { hasValidatedBetaInvite } from "@/features/beta/betaInvite.storage";

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protege rotas que exigem autenticação.
 * Com beta fechado e sem convite na sessão, envia para `/beta` (antes do login).
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <SessionBootstrapSplash />;
  }

  if (!isAuthenticated) {
    if (isBetaClosed() && !hasValidatedBetaInvite()) {
      return <Navigate to="/beta" replace state={{ from: location }} />;
    }
    const loginTarget = isBetaClosed() ? "/auth/login" : "/auth";
    return <Navigate to={loginTarget} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
