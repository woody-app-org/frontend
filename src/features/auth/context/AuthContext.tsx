import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { AuthUser } from "../types";
import {
  getAuthUser,
  loginMock,
  logoutMock,
  logoutSessionMock,
  patchStoredUser,
  registerMock,
} from "../services/auth.service";
import { syncAuthUserToDisplayPatch } from "@/domain/mocks/userDisplayPatchStore";
import type { LoginCredentials, RegisterCredentials } from "../types";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  /** Encerra sessão com latência de API mock; preferir no fluxo “Sair” na UI. */
  logoutAsync: () => Promise<void>;
  /** Atualiza dados da sessão e o `localStorage` (ex.: nome após editar perfil). */
  patchUser: (patch: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readInitialAuthUser(): AuthUser | null {
  const u = getAuthUser();
  if (u) syncAuthUserToDisplayPatch(u);
  return u;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readInitialAuthUser);
  const isLoading = false;

  const login = useCallback(async (credentials: LoginCredentials) => {
    const u = await loginMock(credentials);
    setUser(u);
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    const u = await registerMock(credentials);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    logoutMock();
    setUser(null);
  }, []);

  const logoutAsync = useCallback(async () => {
    await logoutSessionMock();
    setUser(null);
  }, []);

  const patchUser = useCallback((patch: Partial<AuthUser>) => {
    const next = patchStoredUser(patch);
    if (next) setUser(next);
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    logoutAsync,
    patchUser,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

/** Hook de contexto (export nomeado intencional). */
// eslint-disable-next-line react-refresh/only-export-components -- hook pareia com AuthProvider
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
