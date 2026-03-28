import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AuthLayout } from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { OnboardingProgressBar } from "./components/OnboardingProgressBar";
import { useOnboardingNavigation } from "./hooks/useOnboardingNavigation";
import { useOnboardingStepFromLocation } from "./hooks/useOnboardingStepFromLocation";
import { cn } from "@/lib/utils";

/**
 * Layout do onboarding: progresso, voltar, transição entre etapas (Outlet).
 */
export function OnboardingFlow() {
  const { isAuthenticated } = useAuth();
  const step = useOnboardingStepFromLocation();
  const { pathname } = useLocation();
  const { goBack } = useOnboardingNavigation();

  if (isAuthenticated) {
    return <Navigate to="/feed" replace />;
  }

  if (step == null) {
    return <Navigate to="/auth/onboarding/1" replace />;
  }

  const wideSteps = step >= 4 && step <= 5;

  return (
    <AuthLayout>
      <div
        className={cn(
          "w-full flex flex-col gap-4 md:gap-5 flex-1 md:flex-initial min-h-0 transition-[max-width] duration-300",
          wideSteps ? "max-w-3xl" : "max-w-lg"
        )}
      >
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={goBack}
            className={cn(
              "inline-flex items-center gap-2 text-sm font-medium text-[var(--auth-text-on-beige)] md:text-white/90",
              "rounded-lg px-2 py-1.5 -ml-2 hover:bg-black/5 md:hover:bg-white/10 transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--auth-button)]/50"
            )}
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            {step <= 1 ? "Início" : "Etapa anterior"}
          </button>
        </div>

        <OnboardingProgressBar currentStep={step} />

        <div
          key={pathname}
          className={cn(
            "rounded-2xl md:rounded-3xl bg-[var(--auth-panel-maroon)] text-[var(--auth-text-on-maroon)]",
            "p-4 sm:p-6 md:p-8 shadow-none md:shadow-xl flex-1 min-h-0 overflow-y-auto",
            "animate-in fade-in zoom-in-95 duration-300"
          )}
        >
          <Outlet />
        </div>
      </div>
    </AuthLayout>
  );
}
