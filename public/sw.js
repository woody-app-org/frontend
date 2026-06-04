/**
 * Service worker mínimo — elegibilidade PWA no Chrome/Edge.
 * CACHE_VERSION: incrementar após mudar manifest/ícones para forçar atualização.
 */
const CACHE_VERSION = "woody-pwa-v2";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key.startsWith("woody-") && key !== CACHE_VERSION).map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});
