import { api, getApiErrorMessage } from "@/lib/api";

export interface BillingPortalSessionResponse {
  url: string;
}

/**
 * Abre sessão do Stripe Customer Billing Portal (método de pagamento, faturas, cancelamento).
 * O URL é sempre emitido pelo servidor.
 */
export async function createBillingPortalSession(): Promise<BillingPortalSessionResponse> {
  try {
    const { data } = await api.post<BillingPortalSessionResponse>("Billing/portal/session", {});
    if (!data?.url) throw new Error("Resposta do servidor sem URL do portal.");
    return data;
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível abrir a área de gestão na Stripe."));
  }
}
