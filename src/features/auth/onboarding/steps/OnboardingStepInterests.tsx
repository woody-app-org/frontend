import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";
import { useOnboardingDraftContext } from "../OnboardingContext";
import { useOnboardingNavigation } from "../hooks/useOnboardingNavigation";
import { ONBOARDING_INTERESTS, ONBOARDING_MAX_INTERESTS } from "../constants";
import { mockPersistInterests } from "../services/onboardingActionsMock";
import { OnboardingStepHeader } from "../components/OnboardingStepHeader";
import { onboardingStyles } from "../uiTokens";
import { cn } from "@/lib/utils";

/**
 * Etapa 4 — interesses (IDs persistidos no draft para recomendações).
 */
export function OnboardingStepInterests() {
  const { draft, updateDraft } = useOnboardingDraftContext();
  const { goNext } = useOnboardingNavigation();
  const [isSyncing, setIsSyncing] = useState(false);
  const [limitMessage, setLimitMessage] = useState(false);

  const selected = new Set(draft.interestIds ?? []);

  if (!draft.account) {
    return <Navigate to="/auth/onboarding/1" replace />;
  }

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
      setLimitMessage(false);
    } else {
      if (next.size >= ONBOARDING_MAX_INTERESTS) {
        setLimitMessage(true);
        window.setTimeout(() => setLimitMessage(false), 2800);
        return;
      }
      next.add(id);
      setLimitMessage(false);
    }
    updateDraft({ interestIds: [...next] });
  };

  const count = selected.size;
  const canContinue = count >= 1 && count <= ONBOARDING_MAX_INTERESTS;

  const handleContinue = async () => {
    if (!canContinue) return;
    setIsSyncing(true);
    try {
      await mockPersistInterests([...selected]);
      goNext();
    } finally {
      setIsSyncing(false);
    }
  };

  const instructionText =
    count === 0
      ? `SELECIONE DE 1 A ${ONBOARDING_MAX_INTERESTS} TEMAS`
      : count >= ONBOARDING_MAX_INTERESTS
        ? `${ONBOARDING_MAX_INTERESTS} TEMAS — LIMITE ATINGIDO`
        : `${count} ${count === 1 ? "TEMA" : "TEMAS"} SELECIONADO${count === 1 ? "" : "S"} (ATÉ ${ONBOARDING_MAX_INTERESTS})`;

  return (
    <div>
      <OnboardingStepHeader
        icon={Sparkles}
        title="O que mais te move?"
        lead={`Escolha entre 1 e ${ONBOARDING_MAX_INTERESTS} temas. Isso ajuda a sugerir comunidades e conteúdo com mais acerto para você.`}
        trustNote="Você pode mudar seus interesses depois nas configurações do perfil."
      />

      <p className={cn(onboardingStyles.prominentInstruction)} aria-live="polite">
        {instructionText}
      </p>

      {limitMessage ? (
        <p className="mb-3 text-xs font-medium text-[var(--auth-text-on-maroon)]/95 sm:text-sm" role="status">
          Você já escolheu {ONBOARDING_MAX_INTERESTS} temas. Desmarque um para trocar.
        </p>
      ) : null}

      <div className={onboardingStyles.interestGrid}>
        {ONBOARDING_INTERESTS.map((item) => {
          const isOn = selected.has(item.id);
          const atCap = !isOn && selected.size >= ONBOARDING_MAX_INTERESTS;
          const Icon = item.Icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              aria-pressed={isOn}
              disabled={atCap}
              className={cn(
                onboardingStyles.interestCard,
                isOn && onboardingStyles.interestCardSelected,
                atCap && "opacity-45 cursor-not-allowed",
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
                      "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ease-out",
                      isOn
                        ? "border-[var(--auth-button)] bg-[var(--auth-button)] text-white scale-100 opacity-100"
                        : "border-white/22 opacity-55 scale-95"
                    )}
                    aria-hidden
                  >
                    <Check className={cn("size-3.5", !isOn && "opacity-0")} />
                  </span>
                </span>
                <span className="mt-1 block text-xs text-[var(--auth-text-on-maroon)]/68 leading-relaxed">
                  {item.subtitle}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className={onboardingStyles.footerRow}>
        <span />
        <button
          type="button"
          onClick={() => void handleContinue()}
          disabled={!canContinue || isSyncing}
          className={onboardingStyles.primaryBtn}
          aria-busy={isSyncing}
        >
          {isSyncing ? "Salvando…" : "Continuar"}
        </button>
      </div>
    </div>
  );
}
