import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { AuthUser } from "../types";
import { getAuthUser, loginMock, logoutMock, patchStoredUser, registerMock } from "../services/auth.service";
import type { LoginCredentials, RegisterCredentials } from "../types";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  /** Atualiza dados da sessão e o `localStorage` (ex.: nome após editar perfil). */
  patchUser: (patch: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getAuthUser());
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
