import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { isBetaClosed } from "@/config/beta";
import { getStoredBetaInviteCode } from "@/features/beta/betaInvite.storage";
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
  /**
   * Imagem já recortada (etapa 3). Não entra no JSON — upload só após registo com JWT.
   */
  pendingProfileAvatar: File | null;
  /** `URL.createObjectURL` do recorte, só para pré-visualização. */
  pendingProfileAvatarPreviewUrl: string | null;
  setPendingProfileAvatar: (file: File | null) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<OnboardingDraft>(() => {
    const loaded = loadOnboardingDraft();
    if (!isBetaClosed()) return loaded;
    const code = getStoredBetaInviteCode();
    if (!code || loaded.inviteCode) return loaded;
    return { ...loaded, inviteCode: code };
  });
  const [pendingProfileAvatar, setPendingProfileAvatarState] = useState<File | null>(null);
  const [pendingProfileAvatarPreviewUrl, setPendingProfileAvatarPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    saveOnboardingDraft(draft);
  }, [draft]);

  const setPendingProfileAvatar = useCallback((file: File | null) => {
    setPendingProfileAvatarPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
    setPendingProfileAvatarState(file);
  }, []);

  const updateDraft = useCallback((patch: Partial<OnboardingDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetDraft = useCallback(() => {
    setPendingProfileAvatarPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPendingProfileAvatarState(null);
    setDraft({});
    clearOnboardingDraft();
  }, []);

  const value: OnboardingContextValue = {
    draft,
    updateDraft,
    setDraft,
    resetDraft,
    pendingProfileAvatar,
    pendingProfileAvatarPreviewUrl,
    setPendingProfileAvatar,
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
