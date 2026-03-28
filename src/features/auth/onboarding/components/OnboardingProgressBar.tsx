import { ONBOARDING_STEP_LABELS, ONBOARDING_TOTAL_STEPS } from "../constants";
import { cn } from "@/lib/utils";

export interface OnboardingProgressBarProps {
  currentStep: number;
  className?: string;
}

export function OnboardingProgressBar({ currentStep, className }: OnboardingProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (currentStep / ONBOARDING_TOTAL_STEPS) * 100));
  const label = ONBOARDING_STEP_LABELS[currentStep] ?? "";

  return (
    <div className={cn("w-full shrink-0", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-[11px] sm:text-xs text-[var(--auth-text-on-maroon)]/85">
        <span className="font-medium tracking-wide">
          <span className="tabular-nums">Etapa {currentStep}</span>
          <span className="text-[var(--auth-text-on-maroon)]/55"> / {ONBOARDING_TOTAL_STEPS}</span>
          {label ? (
            <span className="hidden sm:inline text-[var(--auth-text-on-maroon)]/65 font-normal">
              {" "}
              · {label}
            </span>
          ) : null}
        </span>
        <span className="tabular-nums text-[var(--auth-text-on-maroon)]/70">{Math.round(pct)}%</span>
      </div>
      <div
        className="mt-2 h-1.5 sm:h-2 rounded-full bg-[var(--auth-panel-beige)]/22 overflow-hidden ring-1 ring-white/5"
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={ONBOARDING_TOTAL_STEPS}
        aria-valuetext={label ? `Etapa ${currentStep} de ${ONBOARDING_TOTAL_STEPS}: ${label}` : undefined}
        aria-label="Progresso do cadastro"
      >
        <div
          className="h-full rounded-full bg-[var(--auth-button)] transition-[width] duration-500 ease-out shadow-sm"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
