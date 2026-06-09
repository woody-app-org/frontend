const MONTH_ABBR_PT = [
  "jan.",
  "fev.",
  "mar.",
  "abr.",
  "mai.",
  "jun.",
  "jul.",
  "ago.",
  "set.",
  "out.",
  "nov.",
  "dez.",
] as const;

/**
 * Metadado de publicação no estilo feed: `13:27 · 06 nov. 26`.
 * Se `value` não for uma data válida (ex.: rótulos mock), devolve o texto original.
 */
export function formatPostCardTimestamp(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  const time = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(d);

  const day = String(d.getDate()).padStart(2, "0");
  const month = MONTH_ABBR_PT[d.getMonth()];
  const year = String(d.getFullYear()).slice(-2);

  return `${time} · ${day} ${month} ${year}`;
}
