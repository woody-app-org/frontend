import { z } from "zod";
import { PASSWORD_MIN_LENGTH } from "../constants";

/** Remove formatação para validar dígitos. */
export function stripCpfDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

/** Formata CPF para exibição (000.000.000-00). */
export function formatCpfDisplay(digits: string): string {
  const d = stripCpfDigits(digits);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
}

/** Validação de CPF (dígitos verificadores) — mesma lógica esperada no backend. */
export function isValidCpfDigits(digits: string): boolean {
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]!, 10) * (10 - i);
  let d1 = (sum * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== parseInt(digits[9]!, 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]!, 10) * (11 - i);
  let d2 = (sum * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === parseInt(digits[10]!, 10);
}

function calcAgeYears(birthIso: string): number {
  const birth = new Date(birthIso + "T12:00:00");
  if (Number.isNaN(birth.getTime())) return -1;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export const onboardingAccountSchema = z.object({
  username: z
    .string()
    .min(1, "Nome de usuário é obrigatório")
    .max(60, "Máximo 60 caracteres")
    .regex(/^[a-zA-Z0-9_.-]+$/, "Use apenas letras, números, _ . -"),
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(PASSWORD_MIN_LENGTH, `Senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres`),
  cpf: z
    .string()
    .min(1, "CPF é obrigatório")
    .transform((s) => stripCpfDigits(s))
    .refine((d) => d.length === 11, "CPF deve ter 11 dígitos")
    .refine((d) => isValidCpfDigits(d), "CPF inválido"),
  birthDate: z
    .string()
    .min(1, "Data de nascimento é obrigatória")
    .refine((s) => !Number.isNaN(new Date(s + "T12:00:00").getTime()), "Data inválida")
    .refine((s) => calcAgeYears(s) >= 14, "É necessário ter pelo menos 14 anos")
    .refine((s) => calcAgeYears(s) <= 120, "Verifique a data informada"),
});

export type OnboardingAccountFormData = z.infer<typeof onboardingAccountSchema>;
