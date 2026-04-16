/**
 * Feature gating derivado da sessão (`AuthUser.subscription`) e alinhado ao backend (`UserSubscriptionStateDto`).
 *
 * Extensões previstas (sem implementar aqui):
 * - Compra/upgrade: nova rota ou fluxo que atualize a assinatura e faça refresh da sessão (re-login ou endpoint `me`).
 * - Renovação/cancelamento: refletidos em `status`, `currentPeriodEnd`, `cancelAtPeriodEnd` vindos da API.
 * - Webhooks/gateway: atualizam `UserSubscription` no servidor; o cliente continua a confiar na API, não no JWT sozinho.
 */
import type { AuthUserSubscription, EffectiveSubscriptionPlan } from "./types";

function normalizePlan(v: unknown): EffectiveSubscriptionPlan {
  return v === "pro" ? "pro" : "free";
}

/** A partir do objeto de assinatura devolvido pela API (ou sessão persistida). */
export function isProUser(subscription?: AuthUserSubscription | null): boolean {
  return normalizePlan(subscription?.effectivePlan) === "pro";
}

export function canCreateCommunity(subscription?: AuthUserSubscription | null): boolean {
  return isProUser(subscription);
}

export function shouldShowProBadge(subscription?: AuthUserSubscription | null): boolean {
  if (subscription?.showProBadge === true) return true;
  return isProUser(subscription);
}

/** Extensível: hoje equivale a Pro; futuras flags podem combinar com `effectivePlan`. */
export function canAccessPremiumFeature(
  subscription: AuthUserSubscription | null | undefined,
  _featureId: string,
): boolean {
  return isProUser(subscription);
}
