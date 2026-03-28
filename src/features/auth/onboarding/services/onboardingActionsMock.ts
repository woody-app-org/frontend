import type { OnboardingAccountFormData } from "../account.validation";

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const DEFAULT_MS = 160;

/**
 * Simula persistência da etapa 1 no servidor. Substituir por `POST /accounts` ou equivalente.
 */
export async function mockPersistAccountStep(
  _data: OnboardingAccountFormData,
  options?: { delayMs?: number }
): Promise<{ ok: true }> {
  await delay(options?.delayMs ?? DEFAULT_MS);
  return { ok: true };
}

/**
 * Simula gravação de interesses. Substituir por `PATCH /users/me/interests`.
 */
export async function mockPersistInterests(
  _interestIds: string[],
  options?: { delayMs?: number }
): Promise<{ ok: true }> {
  await delay(options?.delayMs ?? DEFAULT_MS);
  return { ok: true };
}

/**
 * Simula joins em comunidades. Substituir por chamadas `POST /communities/:id/join` ou batch.
 */
export async function mockPersistCommunityJoins(
  _communityIds: string[],
  options?: { delayMs?: number }
): Promise<{ ok: true }> {
  await delay(options?.delayMs ?? DEFAULT_MS);
  return { ok: true };
}

/**
 * Simula processamento de imagem após leitura local. Substituir por upload S3 + URL.
 */
export async function mockProcessProfileImageLocal(
  _dataUrl: string,
  options?: { delayMs?: number }
): Promise<{ ok: true }> {
  await delay(options?.delayMs ?? 120);
  return { ok: true };
}
