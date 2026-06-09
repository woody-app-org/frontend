/** Ex.: `01` → `# 0 1` (como no layout de referência). */
export function formatPolicyBadge(badge: string): string {
  const digits = badge.replace(/\D/g, "").padStart(2, "0").slice(-2);
  return `# ${digits[0]} ${digits[1]}`;
}
