/** Chaves em sessionStorage — apenas UX; não substituem validação no servidor. */
export const BETA_INVITE_CODE_KEY = "woody_beta_invite_code";
export const BETA_INVITE_VALIDATED_AT_KEY = "woody_beta_invite_validated_at";

export function getStoredBetaInviteCode(): string | null {
  try {
    const raw = sessionStorage.getItem(BETA_INVITE_CODE_KEY)?.trim();
    return raw ? raw : null;
  } catch {
    return null;
  }
}

export function setValidatedBetaInvite(code: string): void {
  try {
    const normalized = code.trim();
    if (!normalized) return;
    sessionStorage.setItem(BETA_INVITE_CODE_KEY, normalized);
    sessionStorage.setItem(BETA_INVITE_VALIDATED_AT_KEY, new Date().toISOString());
  } catch {
    /* storage cheio ou privado */
  }
}

export function clearBetaInviteSession(): void {
  try {
    sessionStorage.removeItem(BETA_INVITE_CODE_KEY);
    sessionStorage.removeItem(BETA_INVITE_VALIDATED_AT_KEY);
  } catch {
    /* ignore */
  }
}

export function hasValidatedBetaInvite(): boolean {
  return !!getStoredBetaInviteCode();
}
