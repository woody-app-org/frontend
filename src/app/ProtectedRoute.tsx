import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { SessionBootstrapSplash } from "@/features/auth/components/SessionBootstrapSplash";
import { isBetaClosed } from "@/config/beta";
import { hasValidatedBetaInvite } from "@/features/beta/betaInvite.storage";
import { resolveVerificationRoute } from "@/features/verification/services/verification.service";

export interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Se `true` (padrão), redireciona contas não aprovadas para o fluxo de verificação.
   * Use `false` nas próprias rotas de verificação para evitar loop de redirecionamento.
   */
  requireVerified?: boolean;
}

/**
 * Protege rotas que exigem autenticação.
 * Com `requireVerified=true` (padrão), também bloqueia contas pendentes/rejeitadas.
 */
export function ProtectedRoute({ children, requireVerified = true }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
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

  if (requireVerified) {
    const status = user?.verificationStatus;
    if (status && status !== "Approved") {
      const target = resolveVerificationRoute(status);
      if (location.pathname !== target) {
        return <Navigate to={target} replace />;
      }
    }
  }

  return <>{children}</>;
}
