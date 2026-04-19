import type { AuthUserSubscription } from "@/features/subscription/types";

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  name?: string;
  /** Presente após login/registo com API ≥ assinaturas; sessões antigas podem omitir até novo login. */
  subscription?: AuthUserSubscription;
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
  /** Opcional: data URL ou URL pública após upload. */
  avatarUrl?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
