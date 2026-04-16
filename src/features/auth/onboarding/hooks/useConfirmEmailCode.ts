import { useCallback, useState } from "react";
import { confirmEmailVerificationCode } from "../services/emailVerification.service";

interface UseConfirmEmailCodeResult {
  isVerifying: boolean;
  verifyError: string | null;
  clearVerifyError: () => void;
  confirmCode: (code: string) => Promise<boolean>;
}

export function useConfirmEmailCode(email: string | undefined): UseConfirmEmailCodeResult {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const confirmCode = useCallback(
    async (code: string): Promise<boolean> => {
      if (!email) {
        setVerifyError("E-mail não encontrado para verificação.");
        return false;
      }

      setIsVerifying(true);
      setVerifyError(null);

      try {
        const response = await confirmEmailVerificationCode(email, code);
        return response.verified;
      } catch (error) {
        setVerifyError(error instanceof Error ? error.message : "Não foi possível verificar o código.");
        return false;
      } finally {
        setIsVerifying(false);
      }
    },
    [email]
  );

  const clearVerifyError = useCallback(() => setVerifyError(null), []);

  return { isVerifying, verifyError, clearVerifyError, confirmCode };
}
