import type { RegisterFormData } from "../lib/validation";

/**
 * Rascunho do cadastro entre etapas.
 * Em produção: evitar persistir senha em sessionStorage — usar sessão no servidor após etapa 1.
 */
export type OnboardingDraft = {
  account?: RegisterFormData;
  emailVerified?: boolean;
  /** Data URL mockada ou vazio até integrar upload */
  profilePhotoDataUrl?: string | null;
  /** IDs mockados de interesses */
  interestIds?: string[];
  /** Slugs mockados de comunidades sugeridas */
  communitySlugs?: string[];
};
