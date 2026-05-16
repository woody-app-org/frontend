/** Tempo relativo amigável para comentários (ex.: "há 23 minutos"). */

const MIN_MS = 60_000;
const HOUR_MS = 60 * MIN_MS;
const DAY_MS = 24 * HOUR_MS;
const MONTH_MS = 30 * DAY_MS;
const YEAR_MS = 365 * DAY_MS;

export function formatCommentTimestamp(iso: string, nowMs: number = Date.now()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  const diff = Math.max(0, nowMs - d.getTime());

  if (diff < 45_000) return "agora há pouco";

  if (diff < HOUR_MS) {
    const m = Math.floor(diff / MIN_MS);
    return m <= 1 ? "há 1 minuto" : `há ${m} minutos`;
  }

  if (diff < DAY_MS) {
    const h = Math.floor(diff / HOUR_MS);
    return h === 1 ? "há 1 hora" : `há ${h} horas`;
  }

  if (diff < MONTH_MS) {
    const days = Math.floor(diff / DAY_MS);
    return days === 1 ? "há 1 dia" : `há ${days} dias`;
  }

  if (diff < YEAR_MS) {
    const months = Math.max(1, Math.floor(diff / MONTH_MS));
    return months === 1 ? "há 1 mês" : `há ${months} meses`;
  }

  const years = Math.floor(diff / YEAR_MS);
  return years === 1 ? "há 1 ano" : `há ${years} anos`;
}
