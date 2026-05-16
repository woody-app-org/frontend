import { z } from "zod";

export const emailVerificationCodeSchema = z.object({
  code: z
    .string()
    .min(1, "Informe o código")
    .regex(/^\d{6}$/, "O código tem 6 dígitos"),
});

export type EmailVerificationCodeFormData = z.infer<typeof emailVerificationCodeSchema>;
