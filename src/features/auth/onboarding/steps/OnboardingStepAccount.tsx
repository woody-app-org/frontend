import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRound } from "lucide-react";
import { AuthInputField } from "../../components/AuthInputField";
import { PASSWORD_MIN_LENGTH } from "../../constants";
import {
  onboardingAccountSchema,
  formatCpfDisplay,
  stripCpfDigits,
  type OnboardingAccountFormData,
} from "../account.validation";
import { useOnboardingDraftContext } from "../OnboardingContext";
import { useOnboardingNavigation } from "../hooks/useOnboardingNavigation";
import { mockPersistAccountStep } from "../services/onboardingActionsMock";
import { OnboardingStepHeader } from "../components/OnboardingStepHeader";
import { onboardingStyles } from "../uiTokens";
import { cn } from "@/lib/utils";

/**
 * Etapa 1 — dados iniciais da conta (validação pronta para espelhar no backend).
 */
export function OnboardingStepAccount() {
  const { draft, updateDraft } = useOnboardingDraftContext();
  const { goNext } = useOnboardingNavigation();
  const [isSaving, setIsSaving] = useState(false);

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

  const { errors, touchedFields } = form.formState;
  const w = form.watch();

  const onSubmit = form.handleSubmit(async (data) => {
    setIsSaving(true);
    try {
      await mockPersistAccountStep(data);
      updateDraft({ account: data });
      goNext();
    } finally {
      setIsSaving(false);
    }
  });

  const canAdvance = form.formState.isValid && !form.formState.isSubmitting && !isSaving;

  return (
    <div>
      <OnboardingStepHeader
        icon={UserRound}
        title="Vamos criar sua conta"
        lead="Poucos dados, em blocos claros. Você pode voltar e ajustar antes de concluir."
        trustNote="Seus dados são tratados com cuidado. Na versão final, etapas sensíveis ficarão protegidas no servidor."
      />

      <form onSubmit={onSubmit} className="space-y-7 sm:space-y-8" noValidate>
        <div>
          <p className={onboardingStyles.sectionLabel}>Como vamos te chamar</p>
          <div className={onboardingStyles.sectionCard}>
            <AuthInputField
              label="Nome de usuário"
              placeholder="ex.: maria.silva"
              type="text"
              autoComplete="username"
              variant="maroon"
              hint="Público na Woody — evite dados muito pessoais."
              valid={!!touchedFields.username && !errors.username && w.username.length > 0}
              {...form.register("username")}
              error={errors.username?.message}
            />
            <AuthInputField
              label="E-mail"
              placeholder="seu@email.com"
              type="email"
              autoComplete="email"
              variant="maroon"
              hint="Usaremos para login e avisos importantes."
              valid={!!touchedFields.email && !errors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(w.email)}
              {...form.register("email")}
              error={errors.email?.message}
            />
          </div>
        </div>

        <div>
          <p className={onboardingStyles.sectionLabel}>Segurança</p>
          <div className={onboardingStyles.sectionCard}>
            <AuthInputField
              label="Senha"
              placeholder="Ex.: MinhaSenh@1"
              type="password"
              autoComplete="new-password"
              variant="maroon"
              hint={`NO MÍNIMO ${PASSWORD_MIN_LENGTH} CARACTERES, 1 LETRA MAIÚSCULA E 1 CARACTERE ESPECIAL (!@#…)`}
              valid={
                !!touchedFields.password &&
                !errors.password &&
                w.password.length >= PASSWORD_MIN_LENGTH &&
                /[A-Z]/.test(w.password) &&
                /[^A-Za-z0-9\s]/.test(w.password)
              }
              {...form.register("password")}
              error={errors.password?.message}
            />
          </div>
        </div>

        <div>
          <p className={onboardingStyles.sectionLabel}>Sobre você</p>
          <div className={onboardingStyles.sectionCard}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 sm:items-start">
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
                    valid={
                      !!touchedFields.cpf && !fieldState.error && stripCpfDigits(field.value).length === 11
                    }
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
                valid={!!touchedFields.birthDate && !errors.birthDate && !!w.birthDate}
                {...form.register("birthDate")}
                error={errors.birthDate?.message}
              />
            </div>
          </div>
        </div>

        <div className={onboardingStyles.footerRow}>
          <span className="hidden sm:block" />
          <button
            type="submit"
            disabled={!canAdvance}
            className={cn(onboardingStyles.primaryBtn, "sm:ml-auto")}
            aria-busy={isSaving}
          >
            {isSaving ? "Salvando..." : "Continuar"}
          </button>
        </div>
      </form>
    </div>
  );
}
