import axios from "axios";
import { api, getMessageFromApiResponseData } from "@/lib/api";

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
    throw new Error(mapSendOrResendError(error));
  }
}

export async function resendEmailVerificationCode(email: string): Promise<SendVerificationCodeResponse> {
  try {
    const { data } = await api.post<SendVerificationCodeResponse>("Auth/resend-verification", {
      email: email.trim(),
    });
    return data;
  } catch (error) {
    throw new Error(mapSendOrResendError(error));
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
    throw new Error(mapConfirmError(error));
  }
}

function mapSendOrResendError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : "Não foi possível enviar o código agora.";
  }

  const status = error.response?.status;
  const apiMessage = getMessageFromApiResponseData(error.response?.data);
  const normalized = apiMessage?.toLowerCase() ?? "";

  if (status === 404 || normalized.includes("não encontrada")) {
    return "Não encontramos esta conta. Revise o e-mail informado na etapa anterior.";
  }
  if (normalized.includes("já verificado")) {
    return "Este e-mail já foi confirmado.";
  }

  return apiMessage ?? "Não foi possível enviar o código agora. Tente novamente em instantes.";
}

function mapConfirmError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : "Não foi possível confirmar o código.";
  }

  const status = error.response?.status;
  const apiMessage = getMessageFromApiResponseData(error.response?.data);
  const normalized = apiMessage?.toLowerCase() ?? "";

  if (normalized.includes("código inválido")) {
    return "Código inválido. Confira os 6 dígitos e tente novamente.";
  }
  if (normalized.includes("código expirado")) {
    return "Código expirado. Solicite um novo código para continuar.";
  }
  if (normalized.includes("já utilizado")) {
    return "Este código já foi utilizado. Solicite um novo código.";
  }
  if (normalized.includes("máximo de tentativas") || normalized.includes("numero máximo")) {
    return "Muitas tentativas. Reenvie o código para continuar.";
  }
  if (status === 404 || normalized.includes("não encontrada")) {
    return "Não encontramos esta conta. Volte à etapa anterior e revise o e-mail.";
  }
  if (normalized.includes("já verificado")) {
    return "Este e-mail já foi confirmado.";
  }

  return apiMessage ?? "Não foi possível confirmar o código agora. Tente novamente.";
}
