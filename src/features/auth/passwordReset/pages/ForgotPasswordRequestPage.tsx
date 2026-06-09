import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { AuthInputField } from "../../components/AuthInputField";
import { OnboardingStepHeader } from "../../onboarding/components/OnboardingStepHeader";
import { onboardingStyles } from "../../onboarding/uiTokens";
import { usePasswordResetFlow } from "../usePasswordResetFlow";
import { requestPasswordReset } from "../services/passwordReset.service";
import { PasswordResetRateLimitError } from "../passwordResetRateLimitError";
import { forgotPasswordEmailSchema, type ForgotPasswordEmailFormData } from "../validation";
import { cn } from "@/lib/utils";

export function ForgotPasswordRequestPage() {
  const navigate = useNavigate();
  const { setRequestResult } = usePasswordResetFlow();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number | null>(null);

  const form = useForm<ForgotPasswordEmailFormData>({
    resolver: zodResolver(forgotPasswordEmailSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    if (isSubmitting) return;
    setErrorMessage(null);
    setRateLimitSeconds(null);
    setIsSubmitting(true);
    try {
      const result = await requestPasswordReset(data.email);
      setRequestResult(data.email.trim().toLowerCase(), result.maskedEmail);
      navigate("/auth/forgot-password/verify", { replace: true });
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
        icon={Mail}
        title="Recuperar senha"
        lead="Digite o e-mail da sua conta. Se ele estiver cadastrado, enviaremos um código de confirmação."
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

        <AuthInputField
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          autoComplete="email"
          inputMode="email"
          variant="maroon"
          disabled={isSubmitting}
          {...form.register("email")}
          error={form.formState.errors.email?.message}
        />

        <button
          type="submit"
          className={cn(onboardingStyles.primaryBtn, "w-full")}
          disabled={isSubmitting || (rateLimitSeconds != null && rateLimitSeconds > 0)}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? "Enviando..." : "Enviar código"}
        </button>
      </form>

      <p className="mt-6 text-center">
        <Link to="/auth/login" className={onboardingStyles.ghostBtn}>
          Voltar para login
        </Link>
      </p>
    </div>
  );
}
