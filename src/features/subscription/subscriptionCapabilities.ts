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
  if (v === "max") return "max";
  return v === "pro" ? "pro" : "free";
}

/** A partir do objeto de assinatura devolvido pela API (ou sessão persistida). */
export function isProUser(subscription?: AuthUserSubscription | null): boolean {
  const plan = normalizePlan(subscription?.effectivePlan);
  return plan === "pro" || plan === "max";
}

/** Somente plano Max pessoal (não basta Pro). */
export function isMaxUser(subscription?: AuthUserSubscription | null): boolean {
  return normalizePlan(subscription?.effectivePlan) === "max";
}

export function canCreateCommunity(subscription?: AuthUserSubscription | null): boolean {
  return isProUser(subscription);
}

/** Colocar comunidade própria em modo privado exige Max pessoal. */
export function canSetOwnedCommunityPrivate(subscription?: AuthUserSubscription | null): boolean {
  return isMaxUser(subscription);
}

export function shouldShowProBadge(subscription?: AuthUserSubscription | null): boolean {
  if (subscription?.showProBadge === true) return true;
  return isProUser(subscription);
}

/** Retorna `"max"`, `"pro"` ou `null` para renderizar o badge correto. */
export function getSubscriptionBadgeTier(
  subscription?: AuthUserSubscription | null,
): "pro" | "max" | null {
  if (subscription?.subscriptionBadge === "max") return "max";
  if (subscription?.subscriptionBadge === "pro") return "pro";
  if (subscription?.showProBadge === true)
    return subscription?.billingPlan === "max" ? "max" : "pro";
  return isProUser(subscription)
    ? subscription?.billingPlan === "max"
      ? "max"
      : "pro"
    : null;
}

/** Extensível: hoje equivale a Pro; futuras flags podem combinar com `effectivePlan`. */
export function canAccessPremiumFeature(
  subscription: AuthUserSubscription | null | undefined,
  _featureId: string,
): boolean {
  return isProUser(subscription);
}
