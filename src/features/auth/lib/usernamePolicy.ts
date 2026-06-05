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
export const USERNAME_INVALID_DOT_PLACEMENT_MESSAGE =
  "O username não pode começar nem terminar com ponto, nem ter pontos seguidos.";
export const USERNAME_RESERVED_MESSAGE = "Este nome de usuário não está disponível.";
export const USERNAME_PERMANENT_LEAD = "Esse será seu @ na Woody. Escolha com calma:";
export const USERNAME_PERMANENT_EMPHASIS = "Ele não poderá ser alterado depois.";

const RESERVED_USERNAMES = new Set([
  "admin",
  "suporte",
  "support",
  "woody",
  "thewoody",
  "moderacao",
  "moderação",
  "root",
  "system",
  "sistema",
  "api",
  "login",
  "logout",
  "signup",
  "register",
  "settings",
  "profile",
  "user",
  "users",
  "comunidade",
  "comunidades",
  "community",
  "communities",
  "planos",
  "plans",
  "ajuda",
  "help",
  "legal",
  "terms",
  "privacy",
]);

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isReservedUsername(normalized: string): boolean {
  return RESERVED_USERNAMES.has(normalized);
}

export function hasValidUsernameDotPlacement(normalized: string): boolean {
  return (
    !normalized.startsWith(".") &&
    !normalized.endsWith(".") &&
    !normalized.includes("..")
  );
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
  if (!hasValidUsernameDotPlacement(value)) {
    return { ok: false, error: USERNAME_INVALID_DOT_PLACEMENT_MESSAGE };
  }
  if (isReservedUsername(value)) {
    return { ok: false, error: USERNAME_RESERVED_MESSAGE };
  }
  return { ok: true, value };
}

/** Filtra digitação para caracteres permitidos (mantém uppercase até normalizar no submit). */
export function filterUsernameInput(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_.]/g, "").slice(0, USERNAME_MAX_LENGTH);
}
