import { useCallback, useState } from "react";
import { createBillingPortalSession } from "../services/billingPortal.service";

export function useStripeCustomerPortal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPortal = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { url } = await createBillingPortalSession();
      window.location.assign(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível abrir o portal.");
      setLoading(false);
    }
  }, []);

  return { openPortal, loading, error };
}
