import type { AuthUserSubscription } from "@/features/subscription/types";

/** Status de verificação de identidade da conta. */
export type VerificationStatus =
  | "PendingDocument"
  | "PendingReview"
  | "Approved"
  | "Rejected";

/** Papel global da utilizadora (independente de cargos em comunidades). */
export type UserRole = "User" | "Admin" | "SuperAdmin";

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  name?: string;
  /** Presente após login/registo com API ≥ assinaturas; sessões antigas podem omitir até novo login. */
  subscription?: AuthUserSubscription;
  /** Status do processo de verificação de identidade. */
  verificationStatus?: VerificationStatus;
  /** Papel global na plataforma (≠ admin de comunidade). */
  role?: UserRole;
  // Campos de perfil estendido — populados a partir de /users/me.
  // Opcionais para compatibilidade com sessões antigas gravadas no localStorage.
  /** URL do banner/capa do perfil. */
  bannerUrl?: string | null;
  /** Bio / descrição curta. */
  bio?: string;
  /** Localização pública definida pela utilizadora. */
  location?: string;
  /** Pronomes declarados. */
  pronouns?: string;
}

/** Sessão atual (espelho de `AuthUser` para vocabulário alinhado ao backend). */
export type CurrentUser = AuthUser;

export interface LoginCredentials {
  username: string;
  password: string;
}

/** Payload de cadastro (onboarding completo ou futura API). */
export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  /** Apenas dígitos (11). */
  cpf: string;
  /** ISO `YYYY-MM-DD`. */
  birthDate: string;
  /** Opcional: URL pública após upload (ex. fluxo fora do onboarding). Não usar data URL. */
  avatarUrl?: string;
  /** Confirmação de leitura e concordância com as Políticas da Woody (obrigatória no servidor). */
  policiesAccepted: boolean;
  /** Opcional: rede social informada para ajudar na validação de autenticidade do perfil. */
  socialNetwork?: string;
  /** Opcional: usuário (handle, sem `@`) na rede social informada. */
  socialUsername?: string;
  /** Obrigatório no servidor quando o beta fechado está ativo. */
  inviteCode?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
