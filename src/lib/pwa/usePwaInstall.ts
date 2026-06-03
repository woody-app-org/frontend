import { useCallback, useEffect, useRef, useState } from "react";
import { isPwaInstalled, markInstalledInStorage } from "./platform";
import type { BeforeInstallPromptEvent } from "./types";

export interface UsePwaInstallResult {
  /** Evento Chromium capturado — botão «Instalar agora» só quando true. */
  canPromptInstall: boolean;
  isInstalled: boolean;
  install: () => Promise<"accepted" | "dismissed" | "unavailable">;
}

export function usePwaInstall(): UsePwaInstallResult {
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [canPromptInstall, setCanPromptInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => isPwaInstalled());

  useEffect(() => {
    const syncInstalled = () => setIsInstalled(isPwaInstalled());
    syncInstalled();

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      deferredRef.current = event as BeforeInstallPromptEvent;
      setCanPromptInstall(true);
    };

    const onInstalled = () => {
      markInstalledInStorage();
      deferredRef.current = null;
      setCanPromptInstall(false);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<"accepted" | "dismissed" | "unavailable"> => {
    const deferred = deferredRef.current;
    if (!deferred) return "unavailable";

    try {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      deferredRef.current = null;
      setCanPromptInstall(false);
      if (outcome === "accepted") {
        markInstalledInStorage();
        setIsInstalled(true);
      }
      return outcome;
    } catch {
      deferredRef.current = null;
      setCanPromptInstall(false);
      return "unavailable";
    }
  }, []);

  return { canPromptInstall, isInstalled, install };
}
