import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
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
    return null;
  }

  if (!isAuthenticated) {
    if (isBetaClosed() && !hasValidatedBetaInvite()) {
      return <Navigate to="/invite" replace state={{ from: location }} />;
    }
    const loginTarget = isBetaClosed() ? "/auth/login" : "/auth";
    return <Navigate to={loginTarget} state={{ from: location }} replace />;
  }

  if (requireVerified) {
    // Se status não está definido (sessão antiga) ou não é Approved, bloquear.
    // Tratar ausência de status como PendingDocument para evitar acesso indevido
    // enquanto o bootstrap ainda não completou ou dados estão desatualizados.
    const status = user?.verificationStatus ?? "PendingDocument";
    if (status !== "Approved") {
      const target = resolveVerificationRoute(status);
      if (location.pathname !== target) {
        return <Navigate to={target} replace />;
      }
    }
  }

  return <>{children}</>;
}
