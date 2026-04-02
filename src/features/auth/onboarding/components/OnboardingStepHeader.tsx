import type { LucideIcon } from "lucide-react";
import { onboardingStyles } from "../uiTokens";
import { cn } from "@/lib/utils";

export interface OnboardingStepHeaderProps {
  title: string;
  /** Texto principal abaixo do título */
  lead: string;
  /** Linha opcional de acolhimento / segurança */
  trustNote?: string;
  icon?: LucideIcon;
  className?: string;
}

/**
 * Cabeçalho consistente das etapas — hierarquia clara e menos ruído no JSX de cada step.
 */
export function OnboardingStepHeader({
  title,
  lead,
  trustNote,
  icon: Icon,
  className,
}: OnboardingStepHeaderProps) {
  return (
    <header className={cn("mb-6 sm:mb-7 md:mb-8 space-y-3 sm:space-y-3.5", className)}>
      {Icon ? (
        <div
          className="flex size-12 items-center justify-center rounded-2xl bg-[var(--auth-panel-beige)]/12 text-[var(--auth-text-on-maroon)] shadow-sm ring-1 ring-white/10 transition-transform duration-300 motion-safe:hover:scale-[1.02]"
          aria-hidden
        >
          <Icon className="size-6 opacity-95" />
        </div>
      ) : null}
      <div className="space-y-2">
        <h1 className={onboardingStyles.stepTitle}>{title}</h1>
        <p className={onboardingStyles.stepLead}>{lead}</p>
        {trustNote ? <p className={onboardingStyles.trustNote}>{trustNote}</p> : null}
      </div>
    </header>
  );
}
