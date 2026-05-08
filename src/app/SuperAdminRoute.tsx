import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { SessionBootstrapSplash } from "@/features/auth/components/SessionBootstrapSplash";
import { resolveVerificationRoute } from "@/features/verification/services/verification.service";

export interface SuperAdminRouteProps {
  children: React.ReactNode;
}

/**
 * Protege rotas exclusivas de SuperAdmin da equipa Woody.
 * Não confundir com admin de comunidade — esse é um papel de domínio diferente.
 */
export function SuperAdminRoute({ children }: SuperAdminRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <SessionBootstrapSplash />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user?.role !== "SuperAdmin") {
    const target = resolveVerificationRoute(user?.verificationStatus);
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
}
