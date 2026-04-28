import { useCallback, useEffect, useState } from "react";
import { fetchProfileSignalStatus } from "../services/profile-signals.service";

/**
 * Estado de elegibilidade para enviar sinais à destinatária (fonte: GET /profile-signals/status).
 * `senderEligible` ignora cooldown por tipo — o botão só some quando bloqueio/preferência impedem.
 */
export function useProfileSignalEligibility(recipientUserId: number) {
  const [status, setStatus] = useState<ProfileSignalStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!Number.isFinite(recipientUserId) || recipientUserId < 1) {
      setStatus(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const next = await fetchProfileSignalStatus(recipientUserId);
      setStatus(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível verificar os sinais.");
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [recipientUserId]);

  useEffect(() => {
    void load();
  }, [load]);

  const senderEligible = status?.senderEligible !== false;
  const eligibilityRestrictionCode = status?.eligibilityRestrictionCode ?? status?.restrictionCode ?? null;

  return {
    loading,
    error,
    status,
    senderEligible,
    eligibilityRestrictionCode,
    reload: load,
  };
}
