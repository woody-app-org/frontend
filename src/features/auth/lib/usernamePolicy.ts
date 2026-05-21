/** Regras de username alinhadas ao backend (`UsernameInputValidator`). */

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

/** a-z, 0-9, underscore, ponto — sem hífen, espaços ou acentos. */
export const USERNAME_PATTERN = /^[a-z0-9_.]+$/;

export const USERNAME_TOO_SHORT_MESSAGE =
  "Nome de usuário muito curto (mín. 3 caracteres).";
export const USERNAME_TOO_LONG_MESSAGE = "Nome de usuário muito longo (máx. 30 caracteres).";
export const USERNAME_INVALID_CHARS_MESSAGE =
  "Use apenas letras minúsculas, números, ponto (.) e sublinhado (_).";

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateUsername(
  raw: string
): { ok: true; value: string } | { ok: false; error: string } {
  const value = normalizeUsername(raw);
  if (value.length < USERNAME_MIN_LENGTH) {
    return { ok: false, error: USERNAME_TOO_SHORT_MESSAGE };
  }
  if (value.length > USERNAME_MAX_LENGTH) {
    return { ok: false, error: USERNAME_TOO_LONG_MESSAGE };
  }
  if (!USERNAME_PATTERN.test(value)) {
    return { ok: false, error: USERNAME_INVALID_CHARS_MESSAGE };
  }
  return { ok: true, value };
}

/** Filtra digitação para caracteres permitidos (mantém uppercase até normalizar no submit). */
export function filterUsernameInput(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_.]/g, "").slice(0, USERNAME_MAX_LENGTH);
}
