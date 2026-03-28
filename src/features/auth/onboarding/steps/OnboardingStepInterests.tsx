import { Navigate } from "react-router-dom";
import { Check } from "lucide-react";
import { useOnboardingDraftContext } from "../OnboardingContext";
import { useOnboardingNavigation } from "../hooks/useOnboardingNavigation";
import { ONBOARDING_INTERESTS } from "../constants";
import { onboardingStyles } from "../uiTokens";
import { cn } from "@/lib/utils";

/**
 * Etapa 4 — interesses (IDs persistidos no draft para recomendações).
 */
export function OnboardingStepInterests() {
  const { draft, updateDraft } = useOnboardingDraftContext();
  const { goNext } = useOnboardingNavigation();

  const selected = new Set(draft.interestIds ?? []);

  if (!draft.account) {
    return <Navigate to="/auth/onboarding/1" replace />;
  }

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    updateDraft({ interestIds: [...next] });
  };

  const count = selected.size;
  const canContinue = count >= 1;

  return (
    <div>
      <h1 className={onboardingStyles.stepTitle}>O que mais te move?</h1>
      <p className={onboardingStyles.stepLead}>
        Escolha um ou mais temas. Usamos isso para sugerir comunidades e conteúdo com mais carinho para você.
      </p>

      <p className={cn(onboardingStyles.selectedBadge, "mb-4")} aria-live="polite">
        {count === 0
          ? "Selecione pelo menos um interesse"
          : `${count} ${count === 1 ? "tema selecionado" : "temas selecionados"}`}
      </p>

      <div className={onboardingStyles.interestGrid}>
        {ONBOARDING_INTERESTS.map((item) => {
          const isOn = selected.has(item.id);
          const Icon = item.Icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              className={cn(
                onboardingStyles.interestCard,
                isOn && onboardingStyles.interestCardSelected,
                "text-left"
              )}
            >
              <span
                className={cn(
                  onboardingStyles.interestIconWrap,
                  isOn && "bg-[var(--auth-button)]/25 text-[var(--auth-text-on-maroon)]"
                )}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-[var(--auth-text-on-maroon)] text-sm sm:text-[0.95rem]">
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
                      isOn
                        ? "border-[var(--auth-button)] bg-[var(--auth-button)] text-white scale-100 opacity-100"
                        : "border-white/25 opacity-60 scale-95"
                    )}
                    aria-hidden
                  >
                    <Check className={cn("size-3.5", !isOn && "opacity-0")} />
                  </span>
                </span>
                <span className="mt-1 block text-xs text-[var(--auth-text-on-maroon)]/70 leading-relaxed">
                  {item.subtitle}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className={onboardingStyles.footerRow}>
        <span />
        <button type="button" onClick={goNext} disabled={!canContinue} className={onboardingStyles.primaryBtn}>
          Continuar
        </button>
      </div>
    </div>
  );
}
