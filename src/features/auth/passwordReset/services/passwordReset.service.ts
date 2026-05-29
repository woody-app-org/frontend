import axios from "axios";
import { api, getMessageFromApiResponseData } from "@/lib/api";
import {
  PasswordResetRateLimitError,
  type PasswordResetRateLimitCode,
} from "../passwordResetRateLimitError";

export interface RequestPasswordResetResponse {
  maskedEmail: string;
  message: string;
}

export interface VerifyPasswordResetCodeResponse {
  resetToken: string;
  expiresInSeconds: number;
}

export interface ConfirmPasswordResetResponse {
  message: string;
}

export async function requestPasswordReset(email: string): Promise<RequestPasswordResetResponse> {
  try {
    const { data } = await api.post<RequestPasswordResetResponse>("Auth/password-reset/request", {
      email: email.trim(),
    });
    return data;
  } catch (error) {
    mapRequestError(error);
  }
}

export async function verifyPasswordResetCode(
  email: string,
  code: string
): Promise<VerifyPasswordResetCodeResponse> {
  try {
    const { data } = await api.post<VerifyPasswordResetCodeResponse>("Auth/password-reset/verify-code", {
      email: email.trim(),
      code: code.replace(/\D/g, ""),
    });
    return data;
  } catch (error) {
    mapVerifyError(error);
  }
}

export async function confirmPasswordReset(
  resetToken: string,
  newPassword: string,
  confirmPassword: string
): Promise<ConfirmPasswordResetResponse> {
  try {
    const { data } = await api.post<ConfirmPasswordResetResponse>("Auth/password-reset/confirm", {
      resetToken,
      newPassword,
      confirmPassword,
    });
    return data;
  } catch (error) {
    mapConfirmError(error);
  }
}

function parseRateLimitAxiosError(
  error: import("axios").AxiosError,
  fallbackCode: PasswordResetRateLimitCode
): PasswordResetRateLimitError {
  const data = error.response?.data;
  const message =
    (typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as { message: unknown }).message === "string"
      ? (data as { message: string }).message.trim()
      : null) ?? "Muitas tentativas. Aguarde um pouco e tente novamente.";

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

  let code: PasswordResetRateLimitCode = fallbackCode;
  if (typeof data === "object" && data !== null && "code" in data) {
    const c = (data as { code: unknown }).code;
    if (
      c === "EMAIL_RATE_LIMITED" ||
      c === "EMAIL_VERIFY_RATE_LIMITED" ||
      c === "PASSWORD_RESET_CONFIRM_RATE_LIMITED" ||
      c === "RATE_LIMITED"
    ) {
      code = c;
    }
  }

  return new PasswordResetRateLimitError(message, retryAfterSeconds, code);
}

function mapRequestError(error: unknown): never {
  if (!axios.isAxiosError(error)) {
    throw error instanceof Error
      ? error
      : new Error("Não foi possível continuar agora. Tente novamente.");
  }

  if (error.response?.status === 429) {
    throw parseRateLimitAxiosError(error, "EMAIL_RATE_LIMITED");
  }

  throw new Error(
    getMessageFromApiResponseData(error.response?.data) ??
      "Não foi possível continuar agora. Tente novamente."
  );
}

function mapVerifyError(error: unknown): never {
  if (!axios.isAxiosError(error)) {
    throw error instanceof Error
      ? error
      : new Error("Código inválido ou expirado.");
  }

  const status = error.response?.status;

  if (status === 429) {
    throw parseRateLimitAxiosError(error, "EMAIL_VERIFY_RATE_LIMITED");
  }

  if (status === 400 || status === 409) {
    throw new Error("Código inválido ou expirado.");
  }

  throw new Error("Não foi possível continuar agora. Tente novamente.");
}

function mapConfirmError(error: unknown): never {
  if (!axios.isAxiosError(error)) {
    throw error instanceof Error
      ? error
      : new Error("Não foi possível continuar agora. Tente novamente.");
  }

  const status = error.response?.status;
  const apiMessage = getMessageFromApiResponseData(error.response?.data);

  if (status === 429) {
    throw parseRateLimitAxiosError(error, "PASSWORD_RESET_CONFIRM_RATE_LIMITED");
  }

  if (status === 400) {
    throw new Error(apiMessage ?? "Não foi possível continuar agora. Tente novamente.");
  }

  throw new Error(apiMessage ?? "Não foi possível continuar agora. Tente novamente.");
}
