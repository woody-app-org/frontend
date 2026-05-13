import { useCallback, useEffect, useRef, useState } from "react";
import { resendEmailVerificationCode, sendEmailVerificationCode } from "../services/emailVerification.service";
import { EmailVerificationRateLimitError } from "../services/emailVerificationRateLimitError";

const SEND_SUCCESS_COOLDOWN_S = 60;

interface UseResendEmailCodeResult {
  cooldown: number;
  isSending: boolean;
  sendFeedback: string | null;
  sendError: string | null;
  sendInitialCode: () => Promise<boolean>;
  resendCode: () => Promise<boolean>;
  clearSendError: () => void;
}

export function useResendEmailCode(email: string | undefined): UseResendEmailCodeResult {
  const [cooldown, setCooldown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [sendFeedback, setSendFeedback] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const cooldownRef = useRef(0);
  cooldownRef.current = cooldown;

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  const sendCode = useCallback(
    async (mode: "initial" | "resend"): Promise<boolean> => {
      if (!email) return false;
      if (mode === "resend" && cooldownRef.current > 0) return false;
      if (inFlight.current) return false;
      inFlight.current = true;
      setIsSending(true);
      setSendError(null);
      setSendFeedback(null);
      try {
        if (mode === "initial") {
          await sendEmailVerificationCode(email);
          setSendFeedback("Código enviado. Se não aparecer, confira a caixa de spam.");
        } else {
          await resendEmailVerificationCode(email);
          setSendFeedback("Novo código enviado. Use sempre o mais recente.");
        }
        setCooldown(SEND_SUCCESS_COOLDOWN_S);
        return true;
      } catch (error) {
        if (error instanceof EmailVerificationRateLimitError) {
          setSendError(error.message);
          setCooldown(error.retryAfterSeconds);
          return false;
        }
        setSendError(error instanceof Error ? error.message : "Falha ao enviar o código.");
        return false;
      } finally {
        inFlight.current = false;
        setIsSending(false);
      }
    },
    [email]
  );

  const sendInitialCode = useCallback(() => sendCode("initial"), [sendCode]);
  const resendCode = useCallback(() => sendCode("resend"), [sendCode]);
  const clearSendError = useCallback(() => setSendError(null), []);

  return { cooldown, isSending, sendFeedback, sendError, sendInitialCode, resendCode, clearSendError };
}
