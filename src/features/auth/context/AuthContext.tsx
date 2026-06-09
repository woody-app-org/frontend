import { useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthUser, LoginCredentials, RegisterCredentials } from "../types";
import {
  bootstrapAuthSession,
  refreshAuthUserFromMe,
  loginMock,
  logoutMock,
  logoutSessionMock,
  patchStoredUser,
  registerMock,
  getAuthUser,
} from "../services/auth.service";
import {
  WOODY_AUTH_LOGOUT_EVENT,
  WOODY_AUTH_REFRESH_USER_EVENT,
  WOODY_AUTH_SESSION_PERSISTED_EVENT,
} from "../authSessionCleanup";
import { AUTH_REFRESH_TOKEN_KEY, AUTH_STORAGE_KEY, AUTH_TOKEN_KEY } from "../constants";
import { getStoredRefreshToken, getStoredToken } from "@/lib/api";
import { SessionBootstrapSplash } from "../components/SessionBootstrapSplash";
// O contexto é um singleton isolado para sobreviver a recarregamentos HMR do Vite
// sem recriar o objeto e quebrar o `useContext` em módulos já carregados.
import { AuthContext, type AuthContextValue } from "./authContextInstance";

export type { AuthContextValue };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const onRemoteLogout = () => setUser(null);
    window.addEventListener(WOODY_AUTH_LOGOUT_EVENT, onRemoteLogout);
    return () => window.removeEventListener(WOODY_AUTH_LOGOUT_EVENT, onRemoteLogout);
  }, []);

  useEffect(() => {
    const onSessionPersisted = () => {
      setUser(getAuthUser());
    };
    window.addEventListener(WOODY_AUTH_SESSION_PERSISTED_EVENT, onSessionPersisted);
    return () => window.removeEventListener(WOODY_AUTH_SESSION_PERSISTED_EVENT, onSessionPersisted);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (
        e.key !== AUTH_TOKEN_KEY &&
        e.key !== AUTH_REFRESH_TOKEN_KEY &&
        e.key !== AUTH_STORAGE_KEY
      ) {
        return;
      }
      if (!getStoredToken() && !getStoredRefreshToken()) {
        setUser(null);
        return;
      }
      setUser(getAuthUser());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    let cancelled = false;

    // Otimístico: usa o utilizador guardado no localStorage imediatamente para evitar
    // tela branca enquanto espera a validação de rede.
    // A validação em background garante que sessões expiradas são limpas logo depois.
    const storedUser = getAuthUser();
    if (storedUser) {
      setUser(storedUser);
      setIsLoading(false); // conteúdo renderiza sem esperar pela rede
    }

    void (async () => {
      try {
        const u = await bootstrapAuthSession();
        if (!cancelled) setUser(u);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        // Se não havia utilizador guardado, só agora sabemos o resultado
        if (!cancelled && !storedUser) setIsLoading(false);
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
    await loginMock(credentials);
    const u = await refreshAuthUserFromMe();
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials): Promise<AuthUser> => {
    await registerMock(credentials);
    const u = await refreshAuthUserFromMe();
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

  /** Sempre renderizar `children` (com `<Outlet />`) para o router manter a árvore sob o provider.
   * Bloquear só com overlay — substituir `children` por splash quebrava rotas/hidratação e podia originar
   * `useAuth` fora do contexto em wrappers como `BetaClosedGate`. */
  return (
    <AuthContext.Provider value={value}>
      {children}
      {isLoading ? (
        <div className="fixed inset-0 z-[9999] min-h-dvh bg-[var(--woody-bg)]">
          <SessionBootstrapSplash />
        </div>
      ) : null}
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
