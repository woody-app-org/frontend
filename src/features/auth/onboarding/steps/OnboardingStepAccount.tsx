import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthInputField } from "../../components/AuthInputField";
import { registerSchema } from "../../lib/validation";
import type { RegisterFormData } from "../../lib/validation";
import { useOnboardingDraftContext } from "../OnboardingContext";
import { useOnboardingNavigation } from "../hooks/useOnboardingNavigation";
import { onboardingStyles } from "../uiTokens";

/**
 * Etapa 1 — dados iniciais da conta (mock; futuro: POST inicial + token de sessão).
 */
export function OnboardingStepAccount() {
  const { draft, updateDraft } = useOnboardingDraftContext();
  const { goNext } = useOnboardingNavigation();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: draft.account ?? {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    updateDraft({ account: data });
    goNext();
  });

  return (
    <div>
      <h1 className={onboardingStyles.stepTitle}>Sua conta</h1>
      <p className={onboardingStyles.stepLead}>
        Vamos começar com o básico. Você poderá revisar tudo antes de entrar na Woody.
      </p>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <AuthInputField
          label="Usuário"
          placeholder="Nome de usuário"
          type="text"
          autoComplete="username"
          variant="maroon"
          {...form.register("username")}
          error={form.formState.errors.username?.message}
        />
        <AuthInputField
          label="E-mail"
          placeholder="seu@email.com"
          type="email"
          autoComplete="email"
          variant="maroon"
          {...form.register("email")}
          error={form.formState.errors.email?.message}
        />
        <AuthInputField
          label="Senha"
          placeholder="Mínimo 6 caracteres"
          type="password"
          autoComplete="new-password"
          variant="maroon"
          {...form.register("password")}
          error={form.formState.errors.password?.message}
        />
        <AuthInputField
          label="Confirmar senha"
          placeholder="Repita a senha"
          type="password"
          autoComplete="new-password"
          variant="maroon"
          {...form.register("confirmPassword")}
          error={form.formState.errors.confirmPassword?.message}
        />

        <div className={onboardingStyles.footerRow}>
          <span />
          <button type="submit" className={onboardingStyles.primaryBtn}>
            Continuar
          </button>
        </div>
      </form>
    </div>
  );
}
