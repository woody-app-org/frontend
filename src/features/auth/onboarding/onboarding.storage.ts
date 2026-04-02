import { ONBOARDING_DRAFT_STORAGE_KEY } from "./constants";
import type { OnboardingDraft } from "./types";

export function loadOnboardingDraft(): OnboardingDraft {
  try {
    const raw = sessionStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as OnboardingDraft;
  } catch {
    return {};
  }
}

export function saveOnboardingDraft(draft: OnboardingDraft): void {
  try {
    sessionStorage.setItem(ONBOARDING_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearOnboardingDraft(): void {
  sessionStorage.removeItem(ONBOARDING_DRAFT_STORAGE_KEY);
}
