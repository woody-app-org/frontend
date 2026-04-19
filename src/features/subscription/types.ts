/** Plano com benefícios ativos (espelha `effectivePlan` da API). */
export type EffectiveSubscriptionPlan = "free" | "pro";

/** Estado de assinatura na sessão / API (`AuthUser.subscription`). */
export interface AuthUserSubscription {
  effectivePlan: EffectiveSubscriptionPlan;
  billingPlan: EffectiveSubscriptionPlan;
  /** Catálogo comercial (ex. `pro_monthly`); opcional até API enviar. */
  planCode?: string | null;
  status: string;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
  showProBadge?: boolean;
}
