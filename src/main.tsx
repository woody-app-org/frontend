import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
// Orientação futura para analytics/pixels (sem CMP hoje): ver `src/lib/privacy/futureConsentNotes.ts`
import "./index.css";
import { initInstallPromptCapture } from "@/lib/pwa/installPromptStore";
import { registerServiceWorker } from "@/lib/pwa/registerServiceWorker";
import App from "./App.tsx";

// ── Sentry ────────────────────────────────────────────────────────────────────
// Inicializado antes do React para capturar erros de bootstrap.
// Só ativo se VITE_SENTRY_DSN estiver definido no ambiente de build.
// Em desenvolvimento local (sem DSN), é completamente inativo — sem custo.
const sentryDsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,

    // Ambiente reflete o modo Vite: "production", "development", etc.
    environment: import.meta.env.MODE,

    // Desabilitar em desenvolvimento — comentar para testar localmente com DSN real.
    enabled: import.meta.env.PROD,

    // 10% das navegações para performance monitoring. Ajustar conforme volume.
    tracesSampleRate: 0.1,

    // Não capturar dados pessoais automaticamente (formulários, cookies).
    sendDefaultPii: false,

    // Integração com React Router para rastrear navegações como transações.
    integrations: [
      Sentry.browserTracingIntegration(),
      // Replay de sessão apenas em erros — não grava a sessão inteira por padrão.
      Sentry.replayIntegration({
        maskAllText: true,    // Oculta todo texto nos replays (proteção de PII).
        blockAllMedia: true,  // Não grava imagens/vídeos nos replays.
      }),
    ],

    // Capturar 0% de replays em sessões normais; 100% quando há erro.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  });
}

initInstallPromptCapture();
registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
