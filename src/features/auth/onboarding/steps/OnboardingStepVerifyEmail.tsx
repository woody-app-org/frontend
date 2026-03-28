import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthInputField } from "../../components/AuthInputField";
import { useOnboardingDraftContext } from "../OnboardingContext";
import { useOnboardingNavigation } from "../hooks/useOnboardingNavigation";
import { MOCK_EMAIL_VERIFICATION_CODE } from "../constants";
import { emailVerificationCodeSchema, type EmailVerificationCodeFormData } from "../validation";
import { onboardingStyles } from "../uiTokens";

/**
 * Etapa 2 — verificação de e-mail (código mockado).
 */
export function OnboardingStepVerifyEmail() {
  const { draft, updateDraft } = useOnboardingDraftContext();
  const { goNext } = useOnboardingNavigation();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<EmailVerificationCodeFormData>({
    resolver: zodResolver(emailVerificationCodeSchema),
    defaultValues: { code: "" },
  });

  if (!draft.account) {
    return <Navigate to="/auth/onboarding/1" replace />;
  }

  const onSubmit = form.handleSubmit((data) => {
    setServerError(null);
    if (data.code !== MOCK_EMAIL_VERIFICATION_CODE) {
      setServerError("Código incorreto. No mock, use 424242.");
      return;
    }
    updateDraft({ emailVerified: true });
    goNext();
  });

  return (
    <div>
      <h1 className={onboardingStyles.stepTitle}>Confirme seu e-mail</h1>
      <p className={onboardingStyles.stepLead}>
        Enviamos um código para <strong className="font-semibold">{draft.account.email}</strong>.
        (Mock: use o código <span className="tabular-nums">{MOCK_EMAIL_VERIFICATION_CODE}</span>.)
      </p>

      <form onSubmit={onSubmit} className="space-y-4 max-w-sm" noValidate>
        {serverError && (
          <p className="text-sm text-red-200 bg-red-900/30 rounded-lg px-3 py-2" role="alert">
            {serverError}
          </p>
        )}
        <AuthInputField
          label="Código de 6 dígitos"
          placeholder="000000"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          variant="maroon"
          maxLength={6}
          {...form.register("code")}
          error={form.formState.errors.code?.message}
        />
        <div className={onboardingStyles.footerRow}>
          <span />
          <button type="submit" className={onboardingStyles.primaryBtn}>
            Verificar e continuar
          </button>
        </div>
      </form>
    </div>
  );
}
