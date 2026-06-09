import { api, getApiErrorMessage } from "@/lib/api";
import type { OnboardingAccountFormData } from "../account.validation";
import { stripCpfDigits } from "../account.validation";
import { normalizeUsername } from "@/features/auth/lib/usernamePolicy";

export type RegistrationField = "username" | "email" | "cpf";

export type FieldAvailability = {
  available: boolean;
  message?: string;
};

export type RegistrationAvailabilityResult = {
  username?: FieldAvailability;
  email?: FieldAvailability;
  cpf?: FieldAvailability;
};

type ApiFieldAvailability = {
  available: boolean;
  message?: string | null;
};

type ApiAvailabilityResponse = {
  username?: ApiFieldAvailability;
  email?: ApiFieldAvailability;
  cpf?: ApiFieldAvailability;
};

function mapField(raw: ApiFieldAvailability | undefined): FieldAvailability | undefined {
  if (!raw) return undefined;
  return {
    available: raw.available,
    message: raw.message?.trim() || undefined,
  };
}

export async function checkRegistrationAvailability(
  fields: Partial<Pick<OnboardingAccountFormData, RegistrationField>>
): Promise<RegistrationAvailabilityResult> {
  try {
    const { data } = await api.post<ApiAvailabilityResponse>("Auth/check-availability", {
      ...(fields.username != null ? { username: normalizeUsername(fields.username) } : {}),
      ...(fields.email != null ? { email: fields.email.trim() } : {}),
      ...(fields.cpf != null ? { cpf: stripCpfDigits(fields.cpf) } : {}),
    });
    return {
      username: mapField(data.username),
      email: mapField(data.email),
      cpf: mapField(data.cpf),
    };
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível verificar os dados. Tente novamente."));
  }
}

/** Campos em conflito com mensagem para exibir no formulário. */
export function collectUnavailableFields(
  result: RegistrationAvailabilityResult
): Partial<Record<RegistrationField, string>> {
  const out: Partial<Record<RegistrationField, string>> = {};
  const entries: [RegistrationField, FieldAvailability | undefined][] = [
    ["username", result.username],
    ["email", result.email],
    ["cpf", result.cpf],
  ];
  for (const [field, info] of entries) {
    if (info && !info.available) {
      out[field] = info.message ?? "Já está em uso.";
    }
  }
  return out;
}
