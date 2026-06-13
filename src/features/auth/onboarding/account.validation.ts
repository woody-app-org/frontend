import { z } from "zod";
import { PASSWORD_MIN_LENGTH } from "../constants";
import { PASSWORD_NO_WHITESPACE_MESSAGE, passwordHasWhitespace } from "../lib/passwordPolicy";
import {
  USERNAME_INVALID_CHARS_MESSAGE,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_TOO_SHORT_MESSAGE,
  hasValidUsernameDotPlacement,
  isReservedUsername,
  normalizeUsername,
  USERNAME_INVALID_DOT_PLACEMENT_MESSAGE,
  USERNAME_RESERVED_MESSAGE,
} from "../lib/usernamePolicy";

/** Redes sociais aceitas para o handle opcional informado no cadastro. */
export const ONBOARDING_SOCIAL_NETWORKS = ["instagram", "tiktok", "x", "threads", "facebook"] as const;
export type OnboardingSocialNetwork = (typeof ONBOARDING_SOCIAL_NETWORKS)[number];

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
    .transform(normalizeUsername)
    .pipe(
      z
        .string()
        .min(USERNAME_MIN_LENGTH, USERNAME_TOO_SHORT_MESSAGE)
        .max(USERNAME_MAX_LENGTH, "Máximo 30 caracteres")
        .regex(/^[a-z0-9_.]+$/, USERNAME_INVALID_CHARS_MESSAGE)
        .refine(hasValidUsernameDotPlacement, USERNAME_INVALID_DOT_PLACEMENT_MESSAGE)
        .refine((value) => !isReservedUsername(value), USERNAME_RESERVED_MESSAGE)
    ),
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .refine((s) => !passwordHasWhitespace(s), PASSWORD_NO_WHITESPACE_MESSAGE)
    .min(PASSWORD_MIN_LENGTH, `Senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres`)
    .regex(/[A-Z]/, "Inclua pelo menos uma letra maiúscula")
    .regex(
      /[^A-Za-z0-9\s]/,
      "Inclua pelo menos um caractere especial (ex.: ! @ # $ % & *)"
    ),
  birthDate: z
    .string()
    .min(1, "Data de nascimento é obrigatória")
    .refine((s) => !Number.isNaN(new Date(s + "T12:00:00").getTime()), "Data inválida")
    .refine((s) => calcAgeYears(s) >= 14, "É necessário ter pelo menos 14 anos")
    .refine((s) => calcAgeYears(s) <= 120, "Verifique a data informada"),
  /** Rede social + usuário, exibidos no perfil para ajudar a validar a autenticidade da conta mais rapidamente. */
  socialNetwork: z.enum(ONBOARDING_SOCIAL_NETWORKS, {
    message: "Selecione uma rede social",
  }),
  socialUsername: z
    .string()
    .min(1, "Informe o seu usuário nessa rede")
    .max(80, "Usuário deve ter no máximo 80 caracteres")
    .transform((s) => s.trim().replace(/^@+/, ""))
    .refine((s) => s.length > 0, "Informe o seu usuário nessa rede"),
});

export type OnboardingAccountFormData = z.infer<typeof onboardingAccountSchema>;
