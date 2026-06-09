import { PWA_INSTALLED_STORAGE_KEY } from "./types";

function getNavigator(): Navigator | undefined {
  return typeof navigator !== "undefined" ? navigator : undefined;
}

function getWindow(): Window | undefined {
  return typeof window !== "undefined" ? window : undefined;
}

/** iPhone / iPad (inclui iPadOS com UA de Mac em alguns casos). */
export function isIOS(): boolean {
  const nav = getNavigator();
  if (!nav) return false;
  const ua = nav.userAgent;
  if (/iPad|iPhone|iPod/i.test(ua)) return true;
  // iPadOS 13+ pode reportar Macintosh
  return nav.platform === "MacIntel" && nav.maxTouchPoints > 1;
}

export function isAndroid(): boolean {
  const ua = getNavigator()?.userAgent ?? "";
  return /Android/i.test(ua);
}

/** Samsung Internet no Android. */
export function isSamsungInternet(): boolean {
  const ua = getNavigator()?.userAgent ?? "";
  return /SamsungBrowser/i.test(ua);
}

/** Microsoft Edge no Android. */
export function isEdgeAndroid(): boolean {
  if (!isAndroid()) return false;
  const ua = getNavigator()?.userAgent ?? "";
  return /EdgA/i.test(ua);
}

/** Firefox no Android. */
export function isFirefoxAndroid(): boolean {
  if (!isAndroid()) return false;
  const ua = getNavigator()?.userAgent ?? "";
  return /Firefox/i.test(ua) && !/EdgA/i.test(ua);
}

/** Chrome no Android (exclui Samsung Internet, Edge e Firefox). */
export function isChromeAndroid(): boolean {
  if (!isAndroid()) return false;
  const ua = getNavigator()?.userAgent ?? "";
  if (isSamsungInternet() || isEdgeAndroid() || isFirefoxAndroid()) return false;
  return /Chrome/i.test(ua);
}

/** Safari no iOS (não Chrome/Edge/Firefox iOS). */
export function isIOSSafari(): boolean {
  if (!isIOS()) return false;
  const ua = getNavigator()?.userAgent ?? "";
  return /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
}

/** Navegador iOS que não é Safari — instruir a abrir no Safari. */
export function isIOSNonSafari(): boolean {
  return isIOS() && !isIOSSafari();
}

export function isMobileViewport(): boolean {
  const win = getWindow();
  if (!win?.matchMedia) return false;
  return win.matchMedia("(max-width: 768px)").matches;
}

export function isDisplayModeStandalone(): boolean {
  const win = getWindow();
  if (!win?.matchMedia) return false;
  return (
    win.matchMedia("(display-mode: standalone)").matches ||
    win.matchMedia("(display-mode: fullscreen)").matches
  );
}

export function isNavigatorStandalone(): boolean {
  return getNavigator()?.standalone === true;
}

export function readInstalledFromStorage(): boolean {
  try {
    return localStorage.getItem(PWA_INSTALLED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markInstalledInStorage(): void {
  try {
    localStorage.setItem(PWA_INSTALLED_STORAGE_KEY, "1");
  } catch {
    /* storage bloqueado — ignorar */
  }
}

/** App já aberta como atalho PWA ou marcada após `appinstalled`. */
export function isPwaInstalled(): boolean {
  return isDisplayModeStandalone() || isNavigatorStandalone() || readInstalledFromStorage();
}

export function supportsBeforeInstallPrompt(): boolean {
  return typeof getWindow()?.addEventListener === "function";
}
