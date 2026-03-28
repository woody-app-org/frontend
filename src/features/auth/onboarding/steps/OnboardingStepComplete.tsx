import { useState, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useOnboardingDraftContext } from "../OnboardingContext";
import { onboardingStyles } from "../uiTokens";

/**
 * Etapa 6 — finalização: chama `register` mockado e limpa o rascunho.
 */
export function OnboardingStepComplete() {
  const { draft, resetDraft } = useOnboardingDraftContext();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const account = draft.account;

  const handleFinish = useCallback(async () => {
    if (!account) return;
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await registerUser(account);
      resetDraft();
      navigate("/feed", { replace: true });
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Não foi possível concluir o cadastro. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [account, navigate, registerUser, resetDraft]);

  if (!account) {
    return <Navigate to="/auth/onboarding/1" replace />;
  }

  return (
    <div>
      <h1 className={onboardingStyles.stepTitle}>Tudo pronto</h1>
      <p className={onboardingStyles.stepLead}>
        Revise mentalmente: usuário <strong className="font-semibold">{account.username}</strong> e
        e-mail confirmado. Ao concluir, você entra na Woody com sua conta mockada.
      </p>

      {errorMessage && (
        <p className="text-sm text-red-200 bg-red-900/30 rounded-lg px-3 py-2 mb-4" role="alert">
          {errorMessage}
        </p>
      )}

      <div className={onboardingStyles.placeholderBox}>
        Resumo e celebração — conteúdo visual refinado nas próximas iterações.
      </div>

      <div className={onboardingStyles.footerRow}>
        <span />
        <button
          type="button"
          onClick={handleFinish}
          disabled={isSubmitting}
          className={onboardingStyles.primaryBtn}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? "Concluindo..." : "Entrar na Woody"}
        </button>
      </div>
    </div>
  );
}
