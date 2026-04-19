import { formatDisplayDateFromIso } from "@/lib/formatIsoDate";
import type { AuthUserSubscription } from "../types";

/** Linha principal de estado para a conta (copy curta, pt-BR). */
export function describeSubscriptionHeadline(sub: AuthUserSubscription): string {
  const pro = sub.effectivePlan === "pro";
  const canceling = sub.status === "canceling" || (Boolean(sub.cancelAtPeriodEnd) && pro);

  if (!pro && sub.billingPlan === "pro" && sub.status === "past_due") {
    return "Pro em pausa por pagamento — regulariza o método na área Stripe para reativar os benefícios.";
  }

  if (pro && sub.status === "past_due") {
    return "Pagamento em falta — atualiza o método na área Stripe para manter o Pro.";
  }
  if (pro && canceling && sub.currentPeriodEnd) {
    return `Cancelamento agendado: manténs o Woody Pro até ${formatDisplayDateFromIso(sub.currentPeriodEnd)}.`;
  }
  if (pro) {
    return "Woody Pro ativo — benefícios premium disponíveis.";
  }
  if (sub.canOpenBillingPortal) {
    return "Sem Pro ativo neste momento — tens conta de faturação na Stripe para rever ou reassumir.";
  }
  return "Plano Free — participa na rede sem subscrição paga.";
}

/** Detalhe secundário (período ou estado técnico). */
export function describeSubscriptionDetail(sub: AuthUserSubscription): string | null {
  if (sub.effectivePlan === "pro" && sub.currentPeriodEnd && sub.status !== "canceling" && !sub.cancelAtPeriodEnd) {
    return `Próxima renovação ou revisão de ciclo (referência): ${formatDisplayDateFromIso(sub.currentPeriodEnd)}.`;
  }
  if (sub.effectivePlan === "pro" && (sub.status === "canceling" || sub.cancelAtPeriodEnd)) {
    return "Após esta data, o plano volta a Free quando o servidor confirmar com a Stripe.";
  }
  const status = (sub.status ?? "").toLowerCase();
  if (status && status !== "active") {
    return `Estado na API: ${status}.`;
  }
  return null;
}
