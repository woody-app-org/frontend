import axios from "axios";

export const ACCOUNT_BANNED_CODE = "ACCOUNT_BANNED";

export const DEFAULT_ACCOUNT_BANNED_MESSAGE =
  "Sua conta foi desativada por violação das regras da Woody.";

export const DEFAULT_ACCOUNT_BANNED_REASON = "Violação das regras da plataforma.";

export interface AccountBannedLoginDetails {
  message: string;
  reason: string;
  bannedAt?: string;
}

export class AccountBannedLoginError extends Error {
  readonly code = ACCOUNT_BANNED_CODE;
  readonly reason: string;
  readonly bannedAt?: string;

  constructor(details: AccountBannedLoginDetails) {
    super(details.message);
    this.name = "AccountBannedLoginError";
    this.reason = details.reason;
    this.bannedAt = details.bannedAt;
  }
}

export function parseAccountBannedLoginResponse(
  data: unknown
): AccountBannedLoginDetails | null {
  if (data == null || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  if (o.code !== ACCOUNT_BANNED_CODE) return null;

  const message =
    typeof o.message === "string" && o.message.trim()
      ? o.message.trim()
      : DEFAULT_ACCOUNT_BANNED_MESSAGE;
  const reason =
    typeof o.reason === "string" && o.reason.trim()
      ? o.reason.trim()
      : DEFAULT_ACCOUNT_BANNED_REASON;
  const bannedAt =
    typeof o.bannedAt === "string" && o.bannedAt.trim() ? o.bannedAt.trim() : undefined;

  return { message, reason, bannedAt };
}

export function parseAccountBannedLoginError(
  err: unknown
): AccountBannedLoginError | null {
  if (!axios.isAxiosError(err) || err.response?.status !== 403) return null;
  const details = parseAccountBannedLoginResponse(err.response?.data);
  if (!details) return null;
  return new AccountBannedLoginError(details);
}

export function formatBannedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}
