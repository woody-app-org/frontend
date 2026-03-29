import type { OnboardingAccountFormData } from "./account.validation";

/**
 * Rascunho do cadastro entre etapas.
 * Em produção: não persistir senha nem CPF em sessionStorage — usar sessão no servidor após etapa 1.
 *
 * Mapa rápido → API:
 * - `account` → criação de conta / registro
 * - `emailVerified` → fluxo verify-email
 * - `profilePhotoDataUrl` → upload de avatar
 * - `interestIds` → PATCH interesses
 * - `joinedCommunityIds` → joins em comunidades
 */
export type OnboardingDraft = {
  account?: OnboardingAccountFormData;
  emailVerified?: boolean;
  /** Data URL da foto ou null se removeu / não enviou */
  profilePhotoDataUrl?: string | null;
  /** Usuária optou por pular foto nesta sessão */
  skippedProfilePhoto?: boolean;
  interestIds?: string[];
  /** IDs de comunidades que a usuária “entrou” durante o onboarding (mock). */
  joinedCommunityIds?: string[];
};
