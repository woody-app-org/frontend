import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthUser, LoginCredentials, RegisterCredentials } from "../types";
import {
  bootstrapAuthSession,
  loginMock,
  logoutMock,
  logoutSessionMock,
  patchStoredUser,
  registerMock,
} from "../services/auth.service";
import { WOODY_AUTH_LOGOUT_EVENT } from "../authSessionCleanup";
import { SessionBootstrapSplash } from "../components/SessionBootstrapSplash";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** `true` apenas até a primeira validação de sessão (`/users/me`) terminar. */
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
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
    logoutAsync,
    patchUser,
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
