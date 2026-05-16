const rel = new Intl.RelativeTimeFormat("pt-PT", { numeric: "auto" });

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

/** Hora curta ou data relativa para a lista de inbox. */
export function formatConversationListTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return rel.format(-diffMin, "minute");
  if (diffMin < 60 * 24 && startOfDay(d) === startOfDay(now)) {
    return d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
  }
  if (diffMin < 60 * 24 * 7) return rel.format(-Math.round(diffMin / (60 * 24)), "day");
  return d.toLocaleDateString("pt-PT", { day: "numeric", month: "short" });
}
