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

  /** Durante a etapa 6 o registo acabou de criar a sessão; ainda precisamos de persistir joins e navegar. */
  if (isAuthenticated && step !== 6) {
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
          "w-full flex flex-col gap-3 sm:gap-4 md:gap-5 transition-[max-width] duration-500 ease-out",
          wideSteps ? "max-w-3xl" : "max-w-lg"
        )}
      >
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={goBack}
            className={cn(
              "inline-flex items-center gap-2 min-h-10 text-sm font-medium text-[var(--auth-text-on-beige)] md:text-white/90",
              "rounded-xl px-2.5 py-2 -ml-1 hover:bg-black/5 md:hover:bg-white/10 active:scale-[0.99] transition-[colors,transform] duration-200 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--auth-button)]/50"
            )}
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            {step <= 1 ? "Início" : "Voltar"}
          </button>
        </div>

        <OnboardingProgressBar currentStep={step} />

        <div
          key={pathname}
          className={cn(
            "rounded-2xl md:rounded-3xl bg-[var(--auth-panel-maroon)] text-[var(--auth-text-on-maroon)]",
            "p-4 sm:p-6 md:p-8 shadow-none md:shadow-lg md:ring-1 md:ring-black/5 overflow-x-hidden",
            "animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out"
          )}
        >
          <Outlet />
        </div>
      </div>
    </AuthLayout>
  );
}
