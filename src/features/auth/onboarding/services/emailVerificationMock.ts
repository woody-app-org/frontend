import { MOCK_EMAIL_VERIFICATION_CODE } from "../constants";

const DEFAULT_DELAY_MS = 650;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export interface MockSendCodeResult {
  ok: true;
  /** Em produção: id da solicitação / expiração. */
  requestId: string;
}

/**
 * Simula envio do código por e-mail. Trocar por POST `/auth/send-verification`.
 */
export async function mockSendVerificationCode(
  email: string,
  options?: { delayMs?: number }
): Promise<MockSendCodeResult> {
  await delay(options?.delayMs ?? DEFAULT_DELAY_MS);
  void email;
  return { ok: true, requestId: `mock-req-${Date.now()}` };
}

export interface MockVerifyCodeResult {
  ok: boolean;
  error?: string;
}

/**
 * Simula validação do código. Trocar por POST `/auth/verify-email`.
 */
export async function mockVerifyEmailCode(
  code: string,
  options?: { delayMs?: number }
): Promise<MockVerifyCodeResult> {
  await delay(options?.delayMs ?? 500);
  const normalized = code.replace(/\D/g, "");
  if (normalized === MOCK_EMAIL_VERIFICATION_CODE) {
    return { ok: true };
  }
  return { ok: false, error: "Código incorreto ou expirado. Tente novamente." };
}
