/** Plano com benefícios ativos (espelha `effectivePlan` da API). */
export type EffectiveSubscriptionPlan = "free" | "pro" | "max";

/** Plano de faturação na API (`billingPlan`); Max partilha benefícios de Pro em `effectivePlan`. */
export type BillingSubscriptionPlan = "free" | "pro" | "max";

/** Estado de assinatura na sessão / API (`AuthUser.subscription`). */
export interface AuthUserSubscription {
  effectivePlan: EffectiveSubscriptionPlan;
  billingPlan: BillingSubscriptionPlan;
  /** Catálogo comercial (ex. `pro_monthly`); opcional até API enviar. */
  planCode?: string | null;
  status: string;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
  showProBadge?: boolean;
  /** Tier do badge: `null` = free, `"pro"` = Pro, `"max"` = Max (API `subscriptionBadge`). */
  subscriptionBadge?: "pro" | "max" | null;
  /** Indica se o backend expôs `cus_…` Stripe — permite abrir o Customer Billing Portal. */
  canOpenBillingPortal?: boolean;
}
