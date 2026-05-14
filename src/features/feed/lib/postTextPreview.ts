/** Primeira linha do texto da publicação (UI / pré-visualizações). */
export function firstLineOfPost(content: string, max = 96): string {
  const line = (content ?? "").trim().split(/\n/)[0]?.trim() ?? "";
  if (!line) return "Publicação";
  if (line.length <= max) return line;
  return `${line.slice(0, Math.max(1, max - 1))}…`;
}
