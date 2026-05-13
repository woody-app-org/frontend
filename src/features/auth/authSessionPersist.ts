import { syncAuthUserToDisplayPatch } from "@/domain/mocks/userDisplayPatchStore";
import { dispatchAuthSessionPersistedEvent } from "./authSessionCleanup";
import { mapAuthUser } from "./authMapper";
import { AUTH_STORAGE_KEY } from "./constants";
import { setStoredRefreshToken, setStoredToken } from "./authTokenStorage";

export interface AuthLoginApiPayload {
  token: string;
  refreshToken: string;
  user: unknown;
}

/** Persiste access + refresh + snapshot de utilizador após login, registo ou refresh. */
export function persistLoginPayload(data: AuthLoginApiPayload): void {
  setStoredToken(data.token);
  setStoredRefreshToken(data.refreshToken);
  const user = mapAuthUser(
    data.user as {
      id: string;
      username: string;
      email?: string;
      name?: string;
      avatarUrl?: string;
      subscription?: unknown;
      verificationStatus?: string;
      role?: string;
    }
  );
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } catch {
    /* storage indisponível */
  }
  syncAuthUserToDisplayPatch(user);
  dispatchAuthSessionPersistedEvent();
}
