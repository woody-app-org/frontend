import { ONBOARDING_TOTAL_STEPS } from "../constants";
import { cn } from "@/lib/utils";

export interface OnboardingProgressBarProps {
  currentStep: number;
  className?: string;
}

export function OnboardingProgressBar({ currentStep, className }: OnboardingProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (currentStep / ONBOARDING_TOTAL_STEPS) * 100));

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between text-xs text-[var(--auth-text-on-maroon)]/80 mb-1.5">
        <span>
          Etapa {currentStep} de {ONBOARDING_TOTAL_STEPS}
        </span>
        <span className="tabular-nums">{Math.round(pct)}%</span>
      </div>
      <div
        className="h-2 rounded-full bg-[var(--auth-panel-beige)]/25 overflow-hidden"
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={ONBOARDING_TOTAL_STEPS}
        aria-label="Progresso do cadastro"
      >
        <div
          className="h-full rounded-full bg-[var(--auth-button)] transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
