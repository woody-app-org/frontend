/** Regista o service worker público (`/sw.js`) para elegibilidade PWA em Chromium. */
export function registerServiceWorker(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      /* Falha silenciosa — instalação manual / iOS ainda funciona */
    });
  });
}
