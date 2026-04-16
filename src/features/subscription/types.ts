/** Plano com benefícios ativos (espelha `effectivePlan` da API). */
export type EffectiveSubscriptionPlan = "free" | "pro";

/** Estado de assinatura na sessão / API (`AuthUser.subscription`). */
export interface AuthUserSubscription {
  effectivePlan: EffectiveSubscriptionPlan;
  billingPlan: EffectiveSubscriptionPlan;
  status: string;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
  showProBadge?: boolean;
}
