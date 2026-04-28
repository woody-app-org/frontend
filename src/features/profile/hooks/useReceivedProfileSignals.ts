import { useCallback, useEffect, useState } from "react";
import {
  archiveProfileSignal,
  fetchReceivedProfileSignals,
  markProfileSignalRead,
  type ProfileSignal,
} from "../services/profile-signals.service";

export function useReceivedProfileSignals() {
  const [signals, setSignals] = useState<ProfileSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [busySignalId, setBusySignalId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await fetchReceivedProfileSignals(1, 30);
      setSignals(page.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível carregar os sinais.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markRead = useCallback(async (signalId: number) => {
    const current = signals.find((signal) => signal.id === signalId);
    if (!current || current.status !== "sent") return current ?? null;

    setBusySignalId(signalId);
    setError(null);
    try {
      const next = await markProfileSignalRead(signalId);
      setSignals((prev) => prev.map((signal) => (signal.id === signalId ? next : signal)));
      return next;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível marcar o sinal como lido.");
      return current;
    } finally {
      setBusySignalId(null);
    }
  }, [signals]);

  const archive = useCallback(async (signalId: number) => {
    setBusySignalId(signalId);
    setError(null);
    try {
      await archiveProfileSignal(signalId);
      setSignals((prev) => prev.filter((signal) => signal.id !== signalId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível arquivar o sinal.");
    } finally {
      setBusySignalId(null);
    }
  }, []);

  return {
    signals,
    loading,
    busySignalId,
    error,
    reload: load,
    markRead,
    archive,
  };
}
