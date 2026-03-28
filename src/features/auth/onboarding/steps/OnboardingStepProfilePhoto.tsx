import { Navigate } from "react-router-dom";
import { useOnboardingDraftContext } from "../OnboardingContext";
import { useOnboardingNavigation } from "../hooks/useOnboardingNavigation";
import { onboardingStyles } from "../uiTokens";

/**
 * Etapa 3 — foto de perfil (placeholder até integrar upload).
 */
export function OnboardingStepProfilePhoto() {
  const { draft, updateDraft } = useOnboardingDraftContext();
  const { goNext } = useOnboardingNavigation();

  if (!draft.account) {
    return <Navigate to="/auth/onboarding/1" replace />;
  }

  const handleContinue = () => {
    updateDraft({ profilePhotoDataUrl: draft.profilePhotoDataUrl ?? null });
    goNext();
  };

  return (
    <div>
      <h1 className={onboardingStyles.stepTitle}>Foto de perfil</h1>
      <p className={onboardingStyles.stepLead}>
        Em breve você poderá enviar uma foto. Por enquanto, avançamos com um perfil sem imagem.
      </p>
      <div className={onboardingStyles.placeholderBox}>
        Área reservada para upload e preview da foto.
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
