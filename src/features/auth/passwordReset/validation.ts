import { z } from "zod";
import { PASSWORD_MIN_LENGTH } from "../constants";
import { PASSWORD_NO_WHITESPACE_MESSAGE, passwordHasWhitespace } from "../lib/passwordPolicy";

export const forgotPasswordEmailSchema = z.object({
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
});

export type ForgotPasswordEmailFormData = z.infer<typeof forgotPasswordEmailSchema>;

const registrationPasswordField = z
  .string()
  .min(1, "Senha é obrigatória")
  .refine((s) => !passwordHasWhitespace(s), PASSWORD_NO_WHITESPACE_MESSAGE)
  .min(PASSWORD_MIN_LENGTH, `Senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres`)
  .regex(/[A-Z]/, "Inclua pelo menos uma letra maiúscula")
  .regex(/[^A-Za-z0-9\s]/, "Inclua pelo menos um caractere especial (ex.: ! @ # $ % & *)");

export const resetPasswordFormSchema = z
  .object({
    newPassword: registrationPasswordField,
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;
