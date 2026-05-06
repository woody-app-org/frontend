/** Evita “ghost click” no feed quando o Radix fecha o diálogo no pointerdown e o click completa no card por baixo. */
let suppressNavigationUntilMs = 0;

export function suppressBackgroundNavigationAfterModalPointerDownOutside(durationMs = 520) {
  suppressNavigationUntilMs = Math.max(suppressNavigationUntilMs, performance.now() + durationMs);
}

export function isBackgroundNavigationSuppressed() {
  return performance.now() < suppressNavigationUntilMs;
}

/** Diálogos Woody usam `data-slot="dialog-content"` em `DialogContent`. */
export function isWoodyModalDialogOpen() {
  if (typeof document === "undefined") return false;
  return document.querySelector('[data-slot="dialog-content"][data-state="open"]') != null;
}
