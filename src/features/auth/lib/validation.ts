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

export type LoginFormData = z.infer<typeof loginSchema>;
