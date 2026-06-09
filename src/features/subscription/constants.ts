/**
 * Promoção de lançamento: planos pagos gratuitos pelos primeiros 12 dias.
 * Mude para `false` quando o período terminar.
 */
export const LAUNCH_PROMO_ACTIVE = true;
export const LAUNCH_PROMO_DAYS = 12;

/** Código de plano reconhecido pelo backend (`BillingPlanCodes.ProMonthly`). */
export const PRO_MONTHLY_CHECKOUT_PLAN_CODE = "pro_monthly";

/** Código de plano reconhecido pelo backend (`BillingPlanCodes.ProAnnual`). */
export const PRO_ANNUAL_CHECKOUT_PLAN_CODE = "pro_annual";

/**
 * Criador Max — a registar no backend / Stripe quando o checkout estiver disponível.
 * @see `MAX_PLAN_CHECKOUT_ENABLED` em `lib/planCatalog.ts`
 */
export const MAX_MONTHLY_CHECKOUT_PLAN_CODE = "max_monthly";

/** @see MAX_MONTHLY_CHECKOUT_PLAN_CODE */
export const MAX_ANNUAL_CHECKOUT_PLAN_CODE = "max_annual";
