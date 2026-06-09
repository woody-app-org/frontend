import {
  MAX_ANNUAL_CHECKOUT_PLAN_CODE,
  MAX_MONTHLY_CHECKOUT_PLAN_CODE,
  PRO_ANNUAL_CHECKOUT_PLAN_CODE,
  PRO_MONTHLY_CHECKOUT_PLAN_CODE,
} from "../constants";

/** Modalidade de pagamento para planos pagos (afeta preço exibido e `planCode` do checkout). */
export type BillingModality = "monthly" | "annual" | "upfront";

/**
 * CTAs do Criador Max usam checkout quando não estiver explicitamente desativado.
 * Defina `VITE_MAX_PLAN_CHECKOUT_ENABLED=false` só para esconder o Max em ambientes sem produtos Stripe.
 */
export const MAX_PLAN_CHECKOUT_ENABLED =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_MAX_PLAN_CHECKOUT_ENABLED !== "false";

/** Quantidade de benefícios mostrados antes de “Ver todos os benefícios”. */
export const PLAN_BENEFITS_PREVIEW_COUNT = {
  essencial: 5,
  pro: 5,
  max: 3,
} as const;

/** Benefícios — texto exatamente como na especificação de produto. */
export const PLAN_ESSENCIAL_BENEFITS: string[] = [
  "Criar Perfil Essencial",
  "Explorar e participar de comunidades",
  "Interagir com posts de terceiros",
  "Criar publicações",
  "Textos de até 500 caracteres",
  "Publicar fotos",
  "FWF – Função Woody Flerte",
];

export const PLAN_CRIADOR_PRO_BENEFITS: string[] = [
  "Ter um perfil profissional de criador de conteúdo",
  "Explorar e participar de comunidades",
  "Interagir com posts de terceiros",
  "Criar publicações",
  "Textos de até 1500 caracteres",
  "Publicar fotos",
  "FWF – Função Woody Flerte",
  "Criar sua própria comunidade na Woody",
  "Exibir o badge Pro no perfil e nas interações",
  "Acessar ferramentas avançadas, insights e recursos prioritários",
  "Apoiar a evolução da plataforma com acesso antecipado a melhorias",
];

/** Primeira linha é destaque; demais itens (após “e mais:”) em bullets. */
export const PLAN_CRIADOR_MAX_INTRO = "Tudo do Criador Pro, e mais:";

export const PLAN_CRIADOR_MAX_BENEFITS: string[] = [
  "Mais de uma comunidade",
  "Impulsionamento de conteúdo",
  "Suporte prioritário",
  "Ferramentas profissionais",
  "Múltiplos administradores",
  "Mais alcance e controle",
];

export interface PaidPlanPriceDisplay {
  primary: string;
  /** Linha secundária (ex.: “em pagamento único”). */
  secondary?: string;
}

/** Preços mensais em reais (exibição na página de planos). */
const PRO_MONTHLY_BRL = 19.7;
const MAX_MONTHLY_BRL = 26;

/** Anual = 10× o mensal (equivalente a ~2 meses grátis), como na oferta anterior. */
const ANNUAL_MONTHS_BILLED = 10;

/** Desconto no pagamento à vista sobre o valor anual equivalente. */
const UPFRONT_DISCOUNT_RATE = 0.15;

function formatBrl(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function annualPriceFromMonthly(monthly: number): number {
  return monthly * ANNUAL_MONTHS_BILLED;
}

function upfrontPriceFromAnnual(annual: number): number {
  return annual * (1 - UPFRONT_DISCOUNT_RATE);
}

function getPaidPriceDisplay(
  monthly: number,
  modality: BillingModality,
): PaidPlanPriceDisplay {
  const annual = annualPriceFromMonthly(monthly);

  switch (modality) {
    case "monthly":
      return { primary: `R$ ${formatBrl(monthly)}/mês` };
    case "annual":
      return { primary: `R$ ${formatBrl(annual)}/ano` };
    case "upfront": {
      const upfront = upfrontPriceFromAnnual(annual);
      return {
        primary: `R$ ${formatBrl(upfront)}`,
        secondary: "em pagamento único · 15% de desconto",
      };
    }
  }
}

export function getProPriceDisplay(modality: BillingModality): PaidPlanPriceDisplay {
  return getPaidPriceDisplay(PRO_MONTHLY_BRL, modality);
}

export function getMaxPriceDisplay(modality: BillingModality): PaidPlanPriceDisplay {
  return getPaidPriceDisplay(MAX_MONTHLY_BRL, modality);
}

/**
 * Código de checkout Stripe (backend `BillingPlanCatalog`).
 * “À vista” usa o mesmo catálogo do anual até existir produto específico de pagamento único.
 */
export function getProCheckoutPlanCode(modality: BillingModality): string {
  if (modality === "monthly") return PRO_MONTHLY_CHECKOUT_PLAN_CODE;
  return PRO_ANNUAL_CHECKOUT_PLAN_CODE;
}

export function getMaxCheckoutPlanCode(modality: BillingModality): string | null {
  if (!MAX_PLAN_CHECKOUT_ENABLED) return null;
  if (modality === "monthly") return MAX_MONTHLY_CHECKOUT_PLAN_CODE;
  return MAX_ANNUAL_CHECKOUT_PLAN_CODE;
}

export type PaidPlanTier = "pro" | "max";

export function getPaidCheckoutPlanCode(tier: PaidPlanTier, modality: BillingModality): string | null {
  if (tier === "pro") return getProCheckoutPlanCode(modality);
  return getMaxCheckoutPlanCode(modality);
}
