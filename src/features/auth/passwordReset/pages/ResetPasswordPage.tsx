import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole } from "lucide-react";
import { AuthPasswordField } from "../../components/AuthPasswordField";
import { withPasswordAutofillSync } from "../../lib/passwordAutofillRegistration";
import { OnboardingStepHeader } from "../../onboarding/components/OnboardingStepHeader";
import { onboardingStyles } from "../../onboarding/uiTokens";
import { usePasswordResetFlow } from "../usePasswordResetFlow";
import { confirmPasswordReset } from "../services/passwordReset.service";
import { PasswordResetRateLimitError } from "../passwordResetRateLimitError";
import { resetPasswordFormSchema, type ResetPasswordFormData } from "../validation";
import { showSuccessToast } from "@/lib/toast/woodyToast";
import { cn } from "@/lib/utils";

const PASSWORD_HINT =
  "No mínimo 6 caracteres, 1 letra maiúscula e 1 caractere especial (!@#…)";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { resetToken, clear } = usePasswordResetFlow();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number | null>(null);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const { register, formState, handleSubmit, setValue } = form;

  if (!resetToken && !isSuccess) {
    return <Navigate to="/auth/forgot-password" replace />;
  }

  const onSubmit = handleSubmit(async (data) => {
    if (isSubmitting) return;
    setErrorMessage(null);
    setRateLimitSeconds(null);
    setIsSubmitting(true);
    try {
      await confirmPasswordReset(resetToken, data.newPassword, data.confirmPassword);
      setIsSuccess(true);
      showSuccessToast("Senha alterada com sucesso. Entre novamente.", {
        id: "password-reset-success",
      });
      navigate("/auth/login", { replace: true });
      clear();
    } catch (err) {
      if (err instanceof PasswordResetRateLimitError) {
        setRateLimitSeconds(err.retryAfterSeconds);
        setErrorMessage("Muitas tentativas. Aguarde um pouco e tente novamente.");
      } else {
        setErrorMessage(
          err instanceof Error ? err.message : "Não foi possível continuar agora. Tente novamente."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="w-full max-w-md">
      <OnboardingStepHeader
        icon={LockKeyhole}
        title="Crie uma nova senha"
        lead="Escolha uma senha segura para acessar sua conta."
      />

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
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

        <AuthPasswordField
          label="Nova senha"
          placeholder="Nova senha"
          autoComplete="new-password"
          hint={PASSWORD_HINT}
          variant="maroon"
          disabled={isSubmitting}
          {...withPasswordAutofillSync(register("newPassword"), setValue, "newPassword")}
          error={formState.errors.newPassword?.message}
        />

        <AuthPasswordField
          label="Confirmar nova senha"
          placeholder="Repita a nova senha"
          autoComplete="new-password"
          variant="maroon"
          disabled={isSubmitting}
          {...withPasswordAutofillSync(
            register("confirmPassword"),
            setValue,
            "confirmPassword"
          )}
          error={formState.errors.confirmPassword?.message}
        />

        <button
          type="submit"
          className={cn(onboardingStyles.primaryBtn, "w-full")}
          disabled={isSubmitting || (rateLimitSeconds != null && rateLimitSeconds > 0)}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Salvar nova senha"}
        </button>
      </form>
    </div>
  );
}
