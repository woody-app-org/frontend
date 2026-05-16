import { useCallback, useEffect, useRef, useState } from "react";
import { confirmEmailVerificationCode } from "../services/emailVerification.service";
import { EmailVerificationRateLimitError } from "../services/emailVerificationRateLimitError";

interface UseConfirmEmailCodeResult {
  isVerifying: boolean;
  verifyError: string | null;
  verifyCooldown: number;
  clearVerifyError: () => void;
  confirmCode: (code: string) => Promise<boolean>;
}

export function useConfirmEmailCode(email: string | undefined): UseConfirmEmailCodeResult {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifyCooldown, setVerifyCooldown] = useState(0);
  const inFlight = useRef(false);

  useEffect(() => {
    if (verifyCooldown <= 0) return;
    const t = window.setInterval(() => setVerifyCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(t);
  }, [verifyCooldown]);

  const confirmCode = useCallback(
    async (code: string): Promise<boolean> => {
      if (!email) {
        setVerifyError("E-mail não encontrado para verificação.");
        return false;
      }
      if (inFlight.current) return false;
      inFlight.current = true;
      setIsVerifying(true);
      setVerifyError(null);

      try {
        const response = await confirmEmailVerificationCode(email, code);
        return response.verified;
      } catch (error) {
        if (error instanceof EmailVerificationRateLimitError) {
          setVerifyError(error.message);
          setVerifyCooldown(error.retryAfterSeconds);
        } else {
          setVerifyError(error instanceof Error ? error.message : "Não foi possível verificar o código.");
        }
        return false;
      } finally {
        inFlight.current = false;
        setIsVerifying(false);
      }
    },
    [email]
  );

  const clearVerifyError = useCallback(() => {
    setVerifyError(null);
  }, []);

  return { isVerifying, verifyError, verifyCooldown, clearVerifyError, confirmCode };
}
