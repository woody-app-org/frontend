/** Regista o service worker público (`/sw.js`) para elegibilidade PWA em Chromium. */
export function registerServiceWorker(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  const register = () => {
    void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      /* Falha silenciosa — instalação manual / iOS ainda funciona */
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", register, { once: true });
  } else {
    register();
  }
}
