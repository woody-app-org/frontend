import type { ComponentProps } from "react";

/** Props HTML comuns para inputs técnicos (autocorrect/autofill/tradução). */
type NativeInputProps = Pick<
  ComponentProps<"input">,
  | "type"
  | "inputMode"
  | "autoComplete"
  | "autoCorrect"
  | "autoCapitalize"
  | "spellCheck"
  | "translate"
>;

/** Username Woody, identificador de login (não e-mail). */
export const identifierInputProps = {
  type: "text",
  autoComplete: "username",
  autoCorrect: "off",
  autoCapitalize: "none",
  spellCheck: false,
  translate: "no",
} satisfies NativeInputProps;

/** Handles de rede social (@usuario), hashtags técnicas. */
export const handleInputProps = {
  type: "text",
  inputMode: "text",
  autoComplete: "off",
  autoCorrect: "off",
  autoCapitalize: "none",
  spellCheck: false,
  translate: "no",
} satisfies NativeInputProps;

/** Código de convite beta, tokens alfanuméricos. */
export const codeInputProps = {
  type: "text",
  autoComplete: "off",
  autoCorrect: "off",
  autoCapitalize: "none",
  spellCheck: false,
  translate: "no",
} satisfies NativeInputProps;

/** CPF e campos numéricos formatados (sem alterar lógica de cursor). */
export const cpfInputProps = {
  type: "text",
  inputMode: "numeric",
  autoComplete: "off",
  autoCorrect: "off",
  autoCapitalize: "none",
  spellCheck: false,
  translate: "no",
} satisfies NativeInputProps;

/** Célula OTP — primeira célula com `one-time-code` para autofill SMS (iOS). */
export function otpCellProps(cellIndex: number): NativeInputProps & { inputMode: "numeric" } {
  return {
    type: "text",
    inputMode: "numeric",
    autoComplete: cellIndex === 0 ? "one-time-code" : "off",
    autoCorrect: "off",
    autoCapitalize: "none",
    spellCheck: false,
    translate: "no",
  };
}
