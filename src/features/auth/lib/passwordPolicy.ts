/** Mensagem alinhada ao backend (`PasswordInputValidator.ContainsWhitespaceMessage`). */
export const PASSWORD_NO_WHITESPACE_MESSAGE = "A senha não pode conter espaços.";

/** Remove espaços, tabs e quebras de linha (login e envio à API). */
export function stripPasswordWhitespace(value: string): string {
  return value.replace(/\s/g, "");
}

export function passwordHasWhitespace(value: string): boolean {
  return /\s/.test(value);
}
