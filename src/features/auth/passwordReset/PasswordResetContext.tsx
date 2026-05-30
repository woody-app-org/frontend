import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface PasswordResetFlowState {
  email: string | null;
  maskedEmail: string | null;
  resetToken: string | null;
}

export interface PasswordResetContextValue extends PasswordResetFlowState {
  setRequestResult: (email: string, maskedEmail: string) => void;
  setResetToken: (token: string) => void;
  clear: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const PasswordResetContext = createContext<PasswordResetContextValue | null>(null);

const emptyState: PasswordResetFlowState = {
  email: null,
  maskedEmail: null,
  resetToken: null,
};

export function PasswordResetProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PasswordResetFlowState>(emptyState);

  const setRequestResult = useCallback((email: string, maskedEmail: string) => {
    setState({ email, maskedEmail, resetToken: null });
  }, []);

  const setResetToken = useCallback((resetToken: string) => {
    setState((prev) => ({ ...prev, resetToken }));
  }, []);

  const clear = useCallback(() => {
    setState(emptyState);
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      setRequestResult,
      setResetToken,
      clear,
    }),
    [state, setRequestResult, setResetToken, clear]
  );

  return <PasswordResetContext.Provider value={value}>{children}</PasswordResetContext.Provider>;
}
