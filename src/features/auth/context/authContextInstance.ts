/**
 * Arquivo separado intencionalmente — contém apenas o singleton do contexto React.
 *
 * O Vite HMR pode re-executar módulos quando os seus dependentes mudam, o que
 * recriaria o `AuthContext` e quebraria qualquer componente que já tivesse feito
 * `useContext` com o objeto antigo (erro "useAuth must be used within AuthProvider").
 *
 * Ao isolar o `createContext()` aqui — num ficheiro sem imports dinâmicos e que
 * raramente muda — garantimos que o objeto é um singleton estável durante toda a
 * sessão de desenvolvimento com HMR.
 */
import { createContext } from "react";
import type { AuthUser } from "../types";
import type { LoginCredentials, RegisterCredentials } from "../types";

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** `true` apenas até a primeira validação de sessão (`/users/me`) terminar. */
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  register: (credentials: RegisterCredentials) => Promise<AuthUser>;
  logout: () => void;
  /** Encerra sessão com latência de API mock; preferir no fluxo "Sair" na UI. */
  logoutAsync: () => Promise<void>;
  /** Atualiza dados da sessão e o `localStorage` (ex.: nome após editar perfil). */
  patchUser: (patch: Partial<AuthUser>) => void;
  /** Re-hidrata o utilizador a partir de `/users/me` (ex.: após aprovação ou 403 de verificação). */
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
