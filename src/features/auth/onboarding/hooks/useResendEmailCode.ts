import { useCallback, useState } from "react";
import { resendEmailVerificationCode, sendEmailVerificationCode } from "../services/emailVerification.service";

interface UseResendEmailCodeResult {
  isSending: boolean;
  sendFeedback: string | null;
  sendError: string | null;
  sendInitialCode: () => Promise<boolean>;
  resendCode: () => Promise<boolean>;
  clearSendError: () => void;
}

export function useResendEmailCode(email: string | undefined): UseResendEmailCodeResult {
  const [isSending, setIsSending] = useState(false);
  const [sendFeedback, setSendFeedback] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const sendCode = useCallback(
    async (mode: "initial" | "resend"): Promise<boolean> => {
      if (!email) return false;
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
        return true;
      } catch (error) {
        setSendError(error instanceof Error ? error.message : "Falha ao enviar o código.");
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [email]
  );

  const sendInitialCode = useCallback(() => sendCode("initial"), [sendCode]);
  const resendCode = useCallback(() => sendCode("resend"), [sendCode]);
  const clearSendError = useCallback(() => setSendError(null), []);

  return { isSending, sendFeedback, sendError, sendInitialCode, resendCode, clearSendError };
}
