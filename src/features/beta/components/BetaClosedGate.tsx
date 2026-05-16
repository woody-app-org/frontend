import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { isBetaClosed } from "@/config/beta";
import { hasValidatedBetaInvite } from "@/features/beta/betaInvite.storage";

interface BetaClosedGateProps {
  children: React.ReactNode;
}

/**
 * Com beta fechado: bloqueia rotas públicas de cadastro/onboarding até haver convite validado em sessionStorage.
 * `/auth/login` fica sempre acessível para quem já tem conta.
 */
function normalizePathname(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed.length > 0 ? trimmed : "/";
}

export function BetaClosedGate({ children }: BetaClosedGateProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const pathname = normalizePathname(location.pathname);

  if (!isBetaClosed()) {
    return <>{children}</>;
  }

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  /** Login continua público com beta fechado (contas já existentes). */
  if (pathname === "/auth/login") {
    return <>{children}</>;
  }

  if (hasValidatedBetaInvite()) {
    return <>{children}</>;
  }

  return <Navigate to="/invite" replace state={{ from: pathname }} />;
}
