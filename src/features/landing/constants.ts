/** IDs de âncora na landing narrativa (`/landing`) — fluxo vertical contínuo. */
export const LANDING_NARRATIVE_IDS = {
  oQueEWoody: "o-que-e-woody",
  missao: "nossa-missao",
  regras: "regras-convivio",
  politicas: "politicas",
  mobileQr: "woody-no-celular",
} as const;

/**
 * IDs legacy (secções antigas: como funciona, planos, etc.).
 * Mantidos para componentes não usados na landing actual; evitar em novo código.
 */
export const LANDING_IDS = {
  comoFunciona: "como-funciona",
  comunidades: "comunidades",
  recursos: "recursos",
  planos: "planos",
  seguranca: "seguranca",
  showcase: "produto",
} as const;
