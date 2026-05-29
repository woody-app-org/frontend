import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { OnboardingStepHeader } from "../../onboarding/components/OnboardingStepHeader";
import { OnboardingCodeInput } from "../../onboarding/components/OnboardingCodeInput";
import { emailVerificationCodeSchema, type EmailVerificationCodeFormData } from "../../onboarding/validation";
import { onboardingStyles } from "../../onboarding/uiTokens";
import { usePasswordResetFlow } from "../PasswordResetContext";
import { verifyPasswordResetCode } from "../services/passwordReset.service";
import { PasswordResetRateLimitError } from "../passwordResetRateLimitError";
import { cn } from "@/lib/utils";

export function ForgotPasswordVerifyCodePage() {
  const navigate = useNavigate();
  const { email, maskedEmail, setResetToken } = usePasswordResetFlow();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number | null>(null);

  const form = useForm<EmailVerificationCodeFormData>({
    resolver: zodResolver(emailVerificationCodeSchema),
    mode: "onChange",
    defaultValues: { code: "" },
  });

  const code = useWatch({ control: form.control, name: "code", defaultValue: "" }) ?? "";
  const codeValid = code.replace(/\D/g, "").length === 6 && !form.formState.errors.code;

  if (!email || !maskedEmail) {
    return <Navigate to="/auth/forgot-password" replace />;
  }

  const onSubmit = form.handleSubmit(async (data) => {
    if (isSubmitting) return;
    setErrorMessage(null);
    setRateLimitSeconds(null);
    setIsSubmitting(true);
    try {
      const result = await verifyPasswordResetCode(email, data.code);
      setResetToken(result.resetToken);
      navigate("/auth/forgot-password/new-password", { replace: true });
    } catch (err) {
      if (err instanceof PasswordResetRateLimitError) {
        setRateLimitSeconds(err.retryAfterSeconds);
        setErrorMessage("Muitas tentativas. Aguarde um pouco e tente novamente.");
      } else {
        setErrorMessage(
          err instanceof Error ? err.message : "Código inválido ou expirado."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="w-full max-w-md">
      <OnboardingStepHeader
        icon={KeyRound}
        title="Confira seu e-mail"
        lead={`Enviamos um código para ${maskedEmail}. Digite o código para continuar.`}
      />

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {errorMessage && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2" role="alert">
            {errorMessage}
            {rateLimitSeconds != null && rateLimitSeconds > 0 ? (
              <span className="block mt-1 text-red-600/90">
                Aguarde {rateLimitSeconds}s antes de tentar novamente.
              </span>
            ) : null}
          </p>
        )}

        <Controller
          name="code"
          control={form.control}
          render={({ field, fieldState }) => (
            <div className="space-y-2">
              <OnboardingCodeInput
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
                hasError={Boolean(fieldState.error)}
                isComplete={codeValid}
                idPrefix="password-reset-otp"
              />
              {fieldState.error?.message ? (
                <p className="text-sm text-red-600" role="alert">
                  {fieldState.error.message}
                </p>
              ) : null}
            </div>
          )}
        />

        <button
          type="submit"
          className={cn(onboardingStyles.primaryBtn, "w-full")}
          disabled={isSubmitting || !codeValid || (rateLimitSeconds != null && rateLimitSeconds > 0)}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? "Confirmando..." : "Confirmar código"}
        </button>
      </form>
    </div>
  );
}
