import { api, getApiErrorMessage } from "@/lib/api";
import { PRO_MONTHLY_CHECKOUT_PLAN_CODE } from "../constants";

export interface CreateSubscriptionCheckoutResponse {
  url: string;
}

/**
 * Inicia checkout Stripe (subscription). O preço é sempre resolvido no servidor a partir do `planCode`.
 */
export async function createSubscriptionCheckout(
  planCode: string = PRO_MONTHLY_CHECKOUT_PLAN_CODE
): Promise<CreateSubscriptionCheckoutResponse> {
  try {
    const { data } = await api.post<CreateSubscriptionCheckoutResponse>("Billing/checkout/subscription", {
      planCode,
    });
    if (!data?.url) throw new Error("Resposta do servidor sem URL de checkout.");
    return data;
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível iniciar o checkout."));
  }
}
