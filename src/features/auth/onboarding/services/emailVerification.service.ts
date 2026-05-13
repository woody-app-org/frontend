import axios from "axios";
import { api, getMessageFromApiResponseData } from "@/lib/api";
import {
  EmailVerificationRateLimitError,
  type EmailRateLimitCode,
} from "./emailVerificationRateLimitError";

export interface SendVerificationCodeResponse {
  requestId: string;
  expiresAt: string;
}

export interface ConfirmVerificationCodeResponse {
  verified: boolean;
  verifiedAt: string;
}

export async function sendEmailVerificationCode(email: string): Promise<SendVerificationCodeResponse> {
  try {
    const { data } = await api.post<SendVerificationCodeResponse>("Auth/send-verification", {
      email: email.trim(),
    });
    return data;
  } catch (error) {
    mapSendOrResendError(error);
  }
}

export async function resendEmailVerificationCode(email: string): Promise<SendVerificationCodeResponse> {
  try {
    const { data } = await api.post<SendVerificationCodeResponse>("Auth/resend-verification", {
      email: email.trim(),
    });
    return data;
  } catch (error) {
    mapSendOrResendError(error);
  }
}

export async function confirmEmailVerificationCode(
  email: string,
  code: string
): Promise<ConfirmVerificationCodeResponse> {
  try {
    const { data } = await api.post<ConfirmVerificationCodeResponse>("Auth/verify-email", {
      email: email.trim(),
      code: code.replace(/\D/g, ""),
    });
    return data;
  } catch (error) {
    mapConfirmError(error);
  }
}

function parseEmailRateLimitAxiosError(
  error: import("axios").AxiosError,
  fallbackCode: EmailRateLimitCode
): EmailVerificationRateLimitError {
  const data = error.response?.data;
  let message =
    (typeof data === "object" && data !== null && "message" in data && typeof (data as { message: unknown }).message === "string"
      ? (data as { message: string }).message.trim()
      : null) ?? "Aguarde um momento antes de tentar novamente.";

  let retryAfterSeconds = 60;
  if (typeof data === "object" && data !== null && "retryAfterSeconds" in data) {
    const v = (data as { retryAfterSeconds: unknown }).retryAfterSeconds;
    if (typeof v === "number" && Number.isFinite(v) && v > 0) retryAfterSeconds = Math.ceil(v);
  }

  const headerRa = error.response?.headers?.["retry-after"] ?? error.response?.headers?.["Retry-After"];
  if (typeof headerRa === "string") {
    const parsed = parseInt(headerRa, 10);
    if (!Number.isNaN(parsed) && parsed > 0) retryAfterSeconds = parsed;
  }

  let code: EmailRateLimitCode = fallbackCode;
  if (typeof data === "object" && data !== null && "code" in data) {
    const c = (data as { code: unknown }).code;
    if (c === "EMAIL_RATE_LIMITED" || c === "EMAIL_VERIFY_RATE_LIMITED" || c === "RATE_LIMITED") {
      code = c;
    }
  }

  return new EmailVerificationRateLimitError(message, retryAfterSeconds, code);
}

function mapSendOrResendError(error: unknown): never {
  if (!axios.isAxiosError(error)) {
    throw error instanceof Error ? error : new Error("Não foi possível enviar o código agora.");
  }

  const status = error.response?.status;
  const apiMessage = getMessageFromApiResponseData(error.response?.data);
  const normalized = apiMessage?.toLowerCase() ?? "";

  if (status === 429) {
    throw parseEmailRateLimitAxiosError(error, "EMAIL_RATE_LIMITED");
  }

  if (status === 404 || normalized.includes("não encontrada")) {
    throw new Error("Não encontramos esta conta. Revise o e-mail informado na etapa anterior.");
  }
  if (normalized.includes("já verificado")) {
    throw new Error("Este e-mail já foi confirmado.");
  }

  throw new Error(apiMessage ?? "Não foi possível enviar o código agora. Tente novamente em instantes.");
}

function mapConfirmError(error: unknown): never {
  if (!axios.isAxiosError(error)) {
    throw error instanceof Error ? error : new Error("Não foi possível confirmar o código.");
  }

  const status = error.response?.status;
  const apiMessage = getMessageFromApiResponseData(error.response?.data);
  const normalized = apiMessage?.toLowerCase() ?? "";

  if (status === 429) {
    throw parseEmailRateLimitAxiosError(error, "EMAIL_VERIFY_RATE_LIMITED");
  }

  if (normalized.includes("código inválido")) {
    throw new Error("Código inválido. Confira os 6 dígitos e tente novamente.");
  }
  if (normalized.includes("código expirado")) {
    throw new Error("Código expirado. Solicite um novo código para continuar.");
  }
  if (normalized.includes("já utilizado")) {
    throw new Error("Este código já foi utilizado. Solicite um novo código.");
  }
  if (normalized.includes("máximo de tentativas") || normalized.includes("numero máximo")) {
    throw new Error("Muitas tentativas. Reenvie o código para continuar.");
  }
  if (status === 404 || normalized.includes("não encontrada")) {
    throw new Error("Não encontramos esta conta. Volte à etapa anterior e revise o e-mail.");
  }
  if (normalized.includes("já verificado")) {
    throw new Error("Este e-mail já foi confirmado.");
  }

  throw new Error(apiMessage ?? "Não foi possível confirmar o código agora. Tente novamente.");
}
