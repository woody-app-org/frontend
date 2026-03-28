import { Navigate } from "react-router-dom";
import { useOnboardingDraftContext } from "../OnboardingContext";
import { useOnboardingNavigation } from "../hooks/useOnboardingNavigation";
import { onboardingStyles } from "../uiTokens";

/**
 * Etapa 5 — sugestão de comunidades (placeholder).
 */
export function OnboardingStepCommunities() {
  const { draft, updateDraft } = useOnboardingDraftContext();
  const { goNext } = useOnboardingNavigation();

  if (!draft.account) {
    return <Navigate to="/auth/onboarding/1" replace />;
  }

  const handleContinue = () => {
    updateDraft({ communitySlugs: draft.communitySlugs ?? [] });
    goNext();
  };

  return (
    <div>
      <h1 className={onboardingStyles.stepTitle}>Comunidades para você</h1>
      <p className={onboardingStyles.stepLead}>
        Em breve sugeriremos grupos alinhados ao que você curte. Por ora, seguimos para a conclusão.
      </p>
      <div className={onboardingStyles.placeholderBox}>
        Cards de comunidades sugeridas (mock) virão aqui.
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
