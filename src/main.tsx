import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Orientação futura para analytics/pixels (sem CMP hoje): ver `src/lib/privacy/futureConsentNotes.ts`
import "./index.css";
import { initInstallPromptCapture } from "@/lib/pwa/installPromptStore";
import { registerServiceWorker } from "@/lib/pwa/registerServiceWorker";
import App from "./App.tsx";

initInstallPromptCapture();
registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
