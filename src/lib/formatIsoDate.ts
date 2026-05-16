/** Formata instante ISO (API .NET) para leitura humana em pt-BR. */
export function formatDisplayDateTimeFromIso(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

/** Apenas data (ex.: fim de período de faturação). */
export function formatDisplayDateFromIso(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(d);
}
