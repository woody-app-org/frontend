import { z } from "zod";
import { PASSWORD_MIN_LENGTH } from "../constants";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Usuário ou e-mail é obrigatório")
    .max(120, "Máximo 120 caracteres"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(PASSWORD_MIN_LENGTH, `Senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres`),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, "Usuário é obrigatório")
      .max(60, "Máximo 60 caracteres")
      .regex(/^[a-zA-Z0-9_.-]+$/, "Use apenas letras, números, _ . -"),
    email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
    password: z
      .string()
      .min(1, "Senha é obrigatória")
      .min(PASSWORD_MIN_LENGTH, `Senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres`),
    confirmPassword: z.string().min(1, "Confirme a senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
