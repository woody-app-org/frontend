import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthUser, LoginCredentials, RegisterCredentials } from "../types";
import {
  bootstrapAuthSession,
  refreshAuthUserFromMe,
  loginMock,
  logoutMock,
  logoutSessionMock,
  patchStoredUser,
  registerMock,
} from "../services/auth.service";
import {
  WOODY_AUTH_LOGOUT_EVENT,
  WOODY_AUTH_REFRESH_USER_EVENT,
} from "../authSessionCleanup";
import { SessionBootstrapSplash } from "../components/SessionBootstrapSplash";

interface AuthContextValue {
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

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const onRemoteLogout = () => setUser(null);
    window.addEventListener(WOODY_AUTH_LOGOUT_EVENT, onRemoteLogout);
    return () => window.removeEventListener(WOODY_AUTH_LOGOUT_EVENT, onRemoteLogout);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const u = await bootstrapAuthSession();
        if (!cancelled) setUser(u);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const u = await refreshAuthUserFromMe();
      setUser(u);
    } catch {
      /* silencioso; falha de rede não deve deslogar nem apagar localStorage */
    }
  }, []);

  useEffect(() => {
    const onRefresh = () => void refreshUser();
    window.addEventListener(WOODY_AUTH_REFRESH_USER_EVENT, onRefresh);
    return () => window.removeEventListener(WOODY_AUTH_REFRESH_USER_EVENT, onRefresh);
  }, [refreshUser]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthUser> => {
    const u = await loginMock(credentials);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials): Promise<AuthUser> => {
    const u = await registerMock(credentials);
    setUser(u);
    return u;
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
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
    logoutAsync,
    patchUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? <SessionBootstrapSplash /> : children}
    </AuthContext.Provider>
  );
}

/** Hook de contexto (export nomeado intencional). */
// eslint-disable-next-line react-refresh/only-export-components -- hook pareia com AuthProvider
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
