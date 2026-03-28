import { Navigate } from "react-router-dom";
import { useOnboardingDraftContext } from "../OnboardingContext";
import { useOnboardingNavigation } from "../hooks/useOnboardingNavigation";
import { onboardingStyles } from "../uiTokens";

/**
 * Etapa 4 — interesses (placeholder).
 */
export function OnboardingStepInterests() {
  const { draft, updateDraft } = useOnboardingDraftContext();
  const { goNext } = useOnboardingNavigation();

  if (!draft.account) {
    return <Navigate to="/auth/onboarding/1" replace />;
  }

  const handleContinue = () => {
    updateDraft({ interestIds: draft.interestIds ?? [] });
    goNext();
  };

  return (
    <div>
      <h1 className={onboardingStyles.stepTitle}>Seus interesses</h1>
      <p className={onboardingStyles.stepLead}>
        Queremos personalizar sua experiência. A seleção detalhada virá na próxima etapa de design.
      </p>
      <div className={onboardingStyles.placeholderBox}>
        Lista de interesses mockada será adicionada aqui.
      </div>
      <div className={onboardingStyles.footerRow}>
        <span />
        <button type="button" onClick={handleContinue} className={onboardingStyles.primaryBtn}>
          Continuar
        </button>
      </div>
    </div>
  );
}
