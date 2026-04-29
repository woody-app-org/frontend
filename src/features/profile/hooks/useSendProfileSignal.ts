import { useCallback, useState } from "react";
import {
  sendProfileSignal,
  getProfileSignalSendErrorMessage,
  type ProfileSignal,
  type ProfileSignalType,
} from "../services/profile-signals.service";

export function useSendProfileSignal(recipientUserId: number) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentSignal, setSentSignal] = useState<ProfileSignal | null>(null);

  const reset = useCallback(() => {
    setError(null);
    setSentSignal(null);
    setBusy(false);
  }, []);

  const send = useCallback(
    async (type: ProfileSignalType) => {
      setBusy(true);
      setError(null);
      setSentSignal(null);
      try {
        const signal = await sendProfileSignal(recipientUserId, type);
        setSentSignal(signal);
        return signal;
      } catch (e) {
        const message = getProfileSignalSendErrorMessage(e);
        setError(message);
        throw e;
      } finally {
        setBusy(false);
      }
    },
    [recipientUserId]
  );

  return {
    busy,
    error,
    sentSignal,
    send,
    reset,
  };
}
