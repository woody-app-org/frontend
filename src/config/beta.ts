/**
 * UX do beta fechado (lançamento controlado). A segurança real está no backend (`BetaAccess.Enabled`).
 *
 * Aceita `true`, `1`, `yes` (trim + case-insensitive). Variáveis Vite são normalmente strings; tratamos
 * defensivamente valores booleanos caso o pipeline de build altere o tipo.
 */
export function isBetaClosed(): boolean {
  const raw = import.meta.env.VITE_BETA_CLOSED as unknown;
  if (raw === true) return true;
  if (raw == null || raw === false) return false;
  const s = String(raw).trim().toLowerCase();
  if (s.length === 0) return false;
  return s === "true" || s === "1" || s === "yes";
}
