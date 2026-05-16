/** Alinhado à validação do backend (`InputValidationLimits`). */
export const POST_COMPOSER_HASHTAGS_MAX = 3;
export const POST_COMPOSER_HASHTAG_MAX_LENGTH = 30;

export type HashtagParseResult =
  | { ok: true; value: string }
  | { ok: false; kind: "empty" }
  | { ok: false; kind: "inner_hash" }
  | { ok: false; kind: "too_long" };

/**
 * Interpreta uma hashtag digitada (com ou sem # inicial).
 * Valor devolvido sem `#` (contrato API: `tags`).
 */
export function parseHashtagInput(raw: string): HashtagParseResult {
  let v = raw.trim();
  while (v.length > 0 && v[0] === "#") {
    v = v.slice(1).trimStart();
  }
  v = v.trim();
  if (v.length === 0) return { ok: false, kind: "empty" };
  if (v.includes("#")) return { ok: false, kind: "inner_hash" };
  if (v.length > POST_COMPOSER_HASHTAG_MAX_LENGTH) return { ok: false, kind: "too_long" };
  return { ok: true, value: v };
}

/** Lista final para o payload: dedupe case-insensitive, máximo 3. */
export function hashtagsToApiTags(chips: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const chip of chips) {
    const r = parseHashtagInput(chip);
    if (!r.ok) continue;
    const key = r.value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r.value);
    if (out.length >= POST_COMPOSER_HASHTAGS_MAX) break;
  }
  return out;
}
