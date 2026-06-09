/**
 * Service worker — elegibilidade PWA Chromium (controle da página + fetch pass-through).
 * CACHE_VERSION: incrementar após mudar manifest/ícones.
 */
const CACHE_VERSION = "woody-pwa-v4-android-icons";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("woody-") && key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

/** Pass-through: não cacheia API nem dados privados; mantém controlo PWA. */
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(fetch(event.request));
});
