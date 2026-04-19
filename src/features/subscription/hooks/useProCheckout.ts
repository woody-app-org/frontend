import { useCallback, useState } from "react";
import { createSubscriptionCheckout } from "../services/billingCheckout.service";

export function useProCheckout() {
  const [loadingCode, setLoadingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = useCallback(async (planCode: string) => {
    setError(null);
    setLoadingCode(planCode);
    try {
      const { url } = await createSubscriptionCheckout(planCode);
      window.location.assign(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível abrir o checkout.");
      setLoadingCode(null);
    }
  }, []);

  return { startCheckout, loadingCode, error };
}
