import type { OnboardingAccountFormData } from "../account.validation";
import {
  checkRegistrationAvailability,
  collectUnavailableFields,
  type RegistrationField,
} from "./registrationAvailability.service";

export class RegistrationAvailabilityConflictError extends Error {
  readonly fieldErrors: Partial<Record<RegistrationField, string>>;

  constructor(fieldErrors: Partial<Record<RegistrationField, string>>) {
    const first = Object.values(fieldErrors)[0];
    super(first ?? "Alguns dados já estão em uso. Ajuste e tente novamente.");
    this.name = "RegistrationAvailabilityConflictError";
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Valida unicidade no servidor antes de avançar da etapa 1 do onboarding.
 */
export async function persistAccountStep(data: OnboardingAccountFormData): Promise<{ ok: true }> {
  const result = await checkRegistrationAvailability({
    username: data.username,
    email: data.email,
  });
  const conflicts = collectUnavailableFields(result);
  if (Object.keys(conflicts).length > 0) {
    throw new RegistrationAvailabilityConflictError(conflicts);
  }
  return { ok: true };
}
