import type { RegisterCredentials } from "../../types";
import type { OnboardingDraft } from "../types";

/**
 * Monta o payload enviado ao `register` (mock hoje → futuro POST de criação de conta).
 *
 * Mapeamento sugerido para API real:
 * - Etapa 1 → `POST /auth/register` ou `POST /accounts` (username, email, password, cpf, birthDate)
 * - Etapa 2 → `POST /auth/verify-email` (já refletido em `draft.emailVerified`)
 * - Etapa 3 → `POST /users/me/avatar` (multipart) → URL pública; hoje: data URL opcional
 * - Etapas 4–5 → após sessão: `PATCH /users/me/interests`, `POST /communities/:id/join` (ver `buildDeferredOnboardingSync`)
 */
export function buildRegisterCredentialsFromDraft(draft: OnboardingDraft): RegisterCredentials | null {
  const a = draft.account;
  if (!a) return null;
  return {
    username: a.username,
    email: a.email,
    password: a.password,
    cpf: a.cpf,
    birthDate: a.birthDate,
    avatarUrl: draft.profilePhotoDataUrl ?? undefined,
  };
}

/** Dados normalmente sincronizados após o token de sessão existir. */
export interface DeferredOnboardingSync {
  interestIds: string[];
  joinedCommunityIds: string[];
}

export function buildDeferredOnboardingSync(draft: OnboardingDraft): DeferredOnboardingSync {
  return {
    interestIds: draft.interestIds ?? [],
    joinedCommunityIds: draft.joinedCommunityIds ?? [],
  };
}
