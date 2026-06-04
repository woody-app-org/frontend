import { useCallback, useEffect, useState } from "react";
import {
  hasDeferredInstallPrompt,
  initInstallPromptCapture,
  subscribeInstallPrompt,
  triggerInstallPrompt,
} from "./installPromptStore";
import { isPwaInstalled } from "./platform";

export interface UsePwaInstallResult {
  /** Evento Chromium capturado — botão de instalação só quando true. */
  canPromptInstall: boolean;
  isInstalled: boolean;
  install: () => Promise<"accepted" | "dismissed" | "unavailable">;
}

export function usePwaInstall(): UsePwaInstallResult {
  const [canPromptInstall, setCanPromptInstall] = useState(() => hasDeferredInstallPrompt());
  const [isInstalled, setIsInstalled] = useState(() => isPwaInstalled());

  useEffect(() => {
    initInstallPromptCapture();

    const sync = () => {
      setCanPromptInstall(hasDeferredInstallPrompt());
      setIsInstalled(isPwaInstalled());
    };

    sync();
    return subscribeInstallPrompt(sync);
  }, []);

  const install = useCallback(() => triggerInstallPrompt(), []);

  return { canPromptInstall, isInstalled, install };
}
