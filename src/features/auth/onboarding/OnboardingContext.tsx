import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { OnboardingDraft } from "./types";
import { clearOnboardingDraft, loadOnboardingDraft, saveOnboardingDraft } from "./onboarding.storage";

interface OnboardingContextValue {
  draft: OnboardingDraft;
  /** Mescla campos no rascunho (persistido em sessionStorage). */
  updateDraft: (patch: Partial<OnboardingDraft>) => void;
  /** Substitui o rascunho inteiro (ex.: hidratar da API). */
  setDraft: React.Dispatch<React.SetStateAction<OnboardingDraft>>;
  /** Limpa storage e estado (após cadastro concluído ou cancelamento explícito). */
  resetDraft: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<OnboardingDraft>(() => loadOnboardingDraft());

  useEffect(() => {
    saveOnboardingDraft(draft);
  }, [draft]);

  const updateDraft = useCallback((patch: Partial<OnboardingDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetDraft = useCallback(() => {
    setDraft({});
    clearOnboardingDraft();
  }, []);

  const value: OnboardingContextValue = {
    draft,
    updateDraft,
    setDraft,
    resetDraft,
  };

  return (
    <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hooks pareados com provider
export function useOnboardingDraftContext(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboardingDraftContext must be used within OnboardingProvider");
  }
  return ctx;
}

