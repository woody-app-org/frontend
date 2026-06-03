/**
 * Service worker mínimo — necessário para elegibilidade de instalação PWA no Chrome/Edge.
 * Sem cache agressivo; apenas ciclo de vida para cumprir critérios do navegador.
 */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
