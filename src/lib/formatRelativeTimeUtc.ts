const rtf =
  typeof Intl !== "undefined"
    ? new Intl.RelativeTimeFormat("pt-PT", { numeric: "auto" })
    : null;

export function formatRelativeTimeUtc(isoUtc: string, nowMs = Date.now()): string {
  const t = Date.parse(isoUtc);
  if (!Number.isFinite(t)) return "";
  const diffSec = Math.round((t - nowMs) / 1000);
  const abs = Math.abs(diffSec);
  if (!rtf) {
    if (abs < 60) return "agora";
    if (abs < 3600) return `${Math.floor(abs / 60)} min`;
    if (abs < 86400) return `${Math.floor(abs / 3600)} h`;
    return `${Math.floor(abs / 86400)} d`;
  }
  if (abs < 45) return rtf.format(0, "second");
  if (abs < 90) return rtf.format(diffSec < 0 ? -1 : 1, "minute");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (abs < 86400 * 7) return rtf.format(Math.round(diffSec / 86400), "day");
  if (abs < 86400 * 30) return rtf.format(Math.round(diffSec / (86400 * 7)), "week");
  if (abs < 86400 * 365) return rtf.format(Math.round(diffSec / (86400 * 30)), "month");
  return rtf.format(Math.round(diffSec / (86400 * 365)), "year");
}
