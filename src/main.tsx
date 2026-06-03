import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Orientação futura para analytics/pixels (sem CMP hoje): ver `src/lib/privacy/futureConsentNotes.ts`
import "./index.css";
import { registerServiceWorker } from "@/lib/pwa/registerServiceWorker";
import App from "./App.tsx";

registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
