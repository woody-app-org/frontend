import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthInputField } from "../../components/AuthInputField";
import {
  onboardingAccountSchema,
  formatCpfDisplay,
  stripCpfDigits,
  type OnboardingAccountFormData,
} from "../account.validation";
import { useOnboardingDraftContext } from "../OnboardingContext";
import { useOnboardingNavigation } from "../hooks/useOnboardingNavigation";
import { onboardingStyles } from "../uiTokens";
import { cn } from "@/lib/utils";

/**
 * Etapa 1 — dados iniciais da conta (validação pronta para espelhar no backend).
 */
export function OnboardingStepAccount() {
  const { draft, updateDraft } = useOnboardingDraftContext();
  const { goNext } = useOnboardingNavigation();

  const form = useForm<OnboardingAccountFormData>({
    resolver: zodResolver(onboardingAccountSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: draft.account ?? {
      username: "",
      email: "",
      password: "",
      cpf: "",
      birthDate: "",
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    updateDraft({ account: data });
    goNext();
  });

  const canAdvance = form.formState.isValid && !form.formState.isSubmitting;

  return (
    <div>
      <h1 className={onboardingStyles.stepTitle}>Vamos criar sua conta</h1>
      <p className={onboardingStyles.stepLead}>
        Poucos dados, bem organizados. Você pode voltar e ajustar antes de concluir.
      </p>

      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        <div>
          <p className={onboardingStyles.sectionLabel}>Como vamos te chamar</p>
          <div className={onboardingStyles.sectionCard}>
            <AuthInputField
              label="Nome de usuário"
              placeholder="ex.: maria.silva"
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
          </div>
        </div>

        <div>
          <p className={onboardingStyles.sectionLabel}>Segurança</p>
          <div className={onboardingStyles.sectionCard}>
            <AuthInputField
              label="Senha"
              placeholder="Mínimo 6 caracteres"
              type="password"
              autoComplete="new-password"
              variant="maroon"
              {...form.register("password")}
              error={form.formState.errors.password?.message}
            />
          </div>
        </div>

        <div>
          <p className={onboardingStyles.sectionLabel}>Sobre você</p>
          <div className={onboardingStyles.sectionCard}>
            <Controller
              name="cpf"
              control={form.control}
              render={({ field, fieldState }) => (
                <AuthInputField
                  label="CPF"
                  placeholder="000.000.000-00"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  variant="maroon"
                  value={formatCpfDisplay(field.value)}
                  onChange={(e) => field.onChange(stripCpfDigits(e.target.value))}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  error={fieldState.error?.message}
                />
              )}
            />
            <AuthInputField
              label="Data de nascimento"
              type="date"
              autoComplete="bday"
              variant="maroon"
              {...form.register("birthDate")}
              error={form.formState.errors.birthDate?.message}
            />
          </div>
        </div>

        <div className={onboardingStyles.footerRow}>
          <span className="hidden sm:block" />
          <button type="submit" disabled={!canAdvance} className={cn(onboardingStyles.primaryBtn, "sm:ml-auto")}>
            Continuar
          </button>
        </div>
      </form>
    </div>
  );
}
