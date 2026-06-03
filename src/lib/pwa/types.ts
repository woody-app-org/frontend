/** Evento `beforeinstallprompt` (Chromium) — não está no lib DOM padrão. */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms?: string[];
  prompt: () => Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

declare global {
  interface Navigator {
    /** Safari iOS — modo standalone quando adicionado à tela inicial. */
    standalone?: boolean;
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export const PWA_INSTALL_PATH = "/install" as const;

export const PWA_INSTALLED_STORAGE_KEY = "woody-pwa-installed" as const;
