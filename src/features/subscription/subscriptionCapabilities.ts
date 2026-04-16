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
