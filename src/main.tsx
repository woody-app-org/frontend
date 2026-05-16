import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Orientação futura para analytics/pixels (sem CMP hoje): ver `src/lib/privacy/futureConsentNotes.ts`
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
