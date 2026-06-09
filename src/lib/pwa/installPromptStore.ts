import { markInstalledInStorage } from "./platform";
import type { BeforeInstallPromptEvent } from "./types";

type InstallOutcome = "accepted" | "dismissed" | "unavailable";

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let captureInitialized = false;
const subscribers = new Set<() => void>();

function notifySubscribers(): void {
  subscribers.forEach((listener) => listener());
}

/**
 * Regista listeners de instalação PWA o mais cedo possível (main.tsx),
 * para não perder `beforeinstallprompt` antes do modal montar.
 */
export function initInstallPromptCapture(): void {
  if (typeof window === "undefined" || captureInitialized) return;
  captureInitialized = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    notifySubscribers();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    markInstalledInStorage();
    notifySubscribers();
  });
}

export function subscribeInstallPrompt(listener: () => void): () => void {
  subscribers.add(listener);
  return () => {
    subscribers.delete(listener);
  };
}

export function hasDeferredInstallPrompt(): boolean {
  return deferredPrompt !== null;
}

export async function triggerInstallPrompt(): Promise<InstallOutcome> {
  const deferred = deferredPrompt;
  if (!deferred) return "unavailable";

  try {
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferredPrompt = null;
    notifySubscribers();
    if (outcome === "accepted") {
      markInstalledInStorage();
    }
    return outcome;
  } catch {
    deferredPrompt = null;
    notifySubscribers();
    return "unavailable";
  }
}

/** Apenas para testes — repõe estado interno. */
export function __resetInstallPromptStoreForTests(): void {
  deferredPrompt = null;
  subscribers.clear();
  captureInitialized = false;
}
