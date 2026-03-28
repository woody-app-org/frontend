import { useLocation } from "react-router-dom";
import { ONBOARDING_TOTAL_STEPS } from "../constants";

/**
 * Lê o índice da etapa a partir do último segmento da URL (`/auth/onboarding/3` → 3).
 */
export function useOnboardingStepFromLocation(): number | null {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last) return null;
  const n = parseInt(last, 10);
  if (!Number.isFinite(n) || n < 1 || n > ONBOARDING_TOTAL_STEPS) return null;
  return n;
}
