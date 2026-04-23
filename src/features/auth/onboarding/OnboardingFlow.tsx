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
              "inline-flex items-center gap-2 min-h-10 text-sm font-medium text-[var(--auth-text-on-beige)]",
              "rounded-xl px-2.5 py-2 -ml-1 hover:bg-black/5 active:scale-[0.99] transition-[colors,transform] duration-200 ease-out",
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
            "relative rounded-2xl md:rounded-3xl bg-white text-[var(--auth-text-on-maroon)] border border-black/10",
            "p-4 sm:p-6 md:p-8 shadow-none md:shadow-xl md:shadow-black/10 overflow-x-hidden",
            "animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out"
          )}
        >
          <div
            className="pointer-events-none absolute left-4 sm:left-6 md:left-7 top-5 bottom-5 hidden sm:block w-1 rounded-full bg-[var(--auth-button)]/95"
            aria-hidden
          />
          <div className="sm:pl-5 md:pl-6">
          <Outlet />
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
