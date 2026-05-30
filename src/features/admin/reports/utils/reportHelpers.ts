export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateLong(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getUserInitials(
  name: string | null | undefined,
  username: string
): string {
  const display = name?.trim() || username;
  const parts = display.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return display.slice(0, 2).toUpperCase();
}

export function targetTypeLabel(type: string): string {
  if (type === "post") return "Post";
  if (type === "comment") return "Comentário";
  return type;
}

export const REASON_CODE_LABELS: Record<string, string> = {
  spam: "Spam",
  hate_speech: "Discurso de ódio",
  harassment: "Assédio",
  misinformation: "Desinformação",
  violence: "Violência",
  nudity: "Nudez",
  other: "Outro",
};

export function reasonLabel(code: string): string {
  return REASON_CODE_LABELS[code] ?? code;
}
