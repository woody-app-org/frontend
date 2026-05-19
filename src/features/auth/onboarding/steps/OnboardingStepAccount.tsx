import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRound } from "lucide-react";
import { AuthInputField } from "../../components/AuthInputField";
import { AuthPasswordField } from "../../components/AuthPasswordField";
import { withPasswordAutofillSync } from "../../lib/passwordAutofillRegistration";
import { PASSWORD_MIN_LENGTH } from "../../constants";
import {
  onboardingAccountSchema,
  formatCpfDisplay,
  stripCpfDigits,
  type OnboardingAccountFormData,
} from "../account.validation";
import { useOnboardingDraftContext } from "../OnboardingContext";
import { useOnboardingNavigation } from "../hooks/useOnboardingNavigation";
import {
  persistAccountStep,
  RegistrationAvailabilityConflictError,
} from "../services/onboardingAccountStep.service";
import {
  checkRegistrationAvailability,
  collectUnavailableFields,
  type RegistrationField,
} from "../services/registrationAvailability.service";
import { OnboardingStepHeader } from "../components/OnboardingStepHeader";
import { onboardingStyles } from "../uiTokens";
import { cn } from "@/lib/utils";
import { isBetaClosed } from "@/config/beta";
import { codeInputProps, cpfInputProps, identifierInputProps } from "@/components/forms";

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
  const { register, setValue, trigger, setError, clearErrors, getValues } = form;

  const verifyFieldAvailability = async (field: RegistrationField) => {
    const valid = await trigger(field);
    if (!valid) return;
    const value = getValues(field);
    try {
      const result = await checkRegistrationAvailability({ [field]: value });
      const conflicts = collectUnavailableFields(result);
      if (conflicts[field]) {
        setError(field, { type: "server", message: conflicts[field] });
      } else {
        clearErrors(field);
      }
    } catch {
      /* falha de rede no blur: o submit principal tenta de novo */
    }
  };

  const onSubmit = form.handleSubmit(async (data) => {
    setIsSaving(true);
    try {
      await persistAccountStep(data);
      updateDraft({
        account: data,
        ...(isBetaClosed() ? { inviteCode: draft.inviteCode?.trim() || undefined } : {}),
      });
      goNext();
    } catch (err) {
      if (err instanceof RegistrationAvailabilityConflictError) {
        for (const [field, message] of Object.entries(err.fieldErrors) as [
          RegistrationField,
          string,
        ][]) {
          setError(field, { type: "server", message });
        }
      }
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
        {isBetaClosed() ? (
          <div>
            <p className={onboardingStyles.sectionLabel}>Convite</p>
            <div className={onboardingStyles.sectionCard}>
              <AuthInputField
                label="Código de convite"
                placeholder="O mesmo código do link ou da página de acesso"
                variant="maroon"
                {...codeInputProps}
                valid={
                  !!draft.inviteCode?.trim() &&
                  (draft.inviteCode?.trim().length ?? 0) >= 4
                }
                value={draft.inviteCode ?? ""}
                onChange={(e) => updateDraft({ inviteCode: e.target.value })}
              />
            </div>
          </div>
        ) : null}

        <div>
          <p className={onboardingStyles.sectionLabel}>Como vamos te chamar</p>
          <div className={onboardingStyles.sectionCard}>
            <AuthInputField
              label="Nome de usuário"
              placeholder="ex: maria_silva"
              variant="maroon"
              valid={!!touchedFields.username && !errors.username && w.username.length > 0}
              {...identifierInputProps}
              {...form.register("username", {
                onBlur: () => void verifyFieldAvailability("username"),
              })}
              error={errors.username?.message}
            />
            <AuthInputField
              label="E-mail"
              placeholder="seu@email.com"
              type="email"
              autoComplete="email"
              variant="maroon"
              valid={!!touchedFields.email && !errors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(w.email)}
              {...form.register("email", {
                onBlur: () => void verifyFieldAvailability("email"),
              })}
              error={errors.email?.message}
            />
          </div>
        </div>

        <div>
          <p className={onboardingStyles.sectionLabel}>Segurança</p>
          <div className={onboardingStyles.sectionCard}>
            <AuthPasswordField
              label="Senha"
              placeholder="ex: MinhaSenh@1"
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
              {...withPasswordAutofillSync(register("password"), setValue, "password", trigger)}
              disabled={isSaving}
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
                    variant="maroon"
                    {...cpfInputProps}
                    valid={
                      !!touchedFields.cpf && !fieldState.error && stripCpfDigits(field.value).length === 11
                    }
                    value={formatCpfDisplay(field.value)}
                    onChange={(e) => field.onChange(stripCpfDigits(e.target.value))}
                    onBlur={() => {
                      field.onBlur();
                      void verifyFieldAvailability("cpf");
                    }}
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
