import type { OnboardingAccountFormData } from "./account.validation";

/**
 * Rascunho do cadastro entre etapas.
 * Em produção: não persistir senha nem CPF em sessionStorage — usar sessão no servidor após etapa 1.
 *
 * Mapa rápido → API:
 * - `account` → criação de conta / registro
 * - `emailVerified` → fluxo verify-email
 * - foto recortada → `pendingProfileAvatar` no contexto (File em memória); upload após JWT
 * - `interestIds` → PATCH interesses
 * - `joinedCommunityIds` → joins em comunidades
 */
export type OnboardingDraft = {
  account?: OnboardingAccountFormData;
  emailVerified?: boolean;
  /** Usuária optou por pular foto nesta sessão */
  skippedProfilePhoto?: boolean;
  interestIds?: string[];
  /** IDs de comunidades escolhidas no onboarding; persistidas na API após registo (JWT). */
  joinedCommunityIds?: string[];
};
