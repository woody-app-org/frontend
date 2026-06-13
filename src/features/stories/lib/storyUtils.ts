import type { Story, StoryMediaType } from "../types";

const MEDIA_TYPES = new Set<StoryMediaType>(["image", "video", "text", "shared_post"]);

export function parseStoryMediaType(raw: unknown): StoryMediaType {
  const v = String(raw ?? "").toLowerCase();
  if (MEDIA_TYPES.has(v as StoryMediaType)) return v as StoryMediaType;
  return "image";
}

export function isStoryNotExpired(story: Story, nowMs = Date.now()): boolean {
  const exp = Date.parse(story.expiresAt);
  return Number.isFinite(exp) && exp > nowMs;
}

export function filterActiveStories(stories: Story[], nowMs = Date.now()): Story[] {
  return stories.filter((s) => isStoryNotExpired(s, nowMs));
}

/** Cor de fundo de story de texto — só hex #RRGGBB; caso contrário fallback Woody. */
export function resolveStoryTextBackground(color: string | null | undefined): string {
  if (color && /^#[0-9A-Fa-f]{6}$/.test(color.trim())) return color.trim();
  return "var(--woody-nav)";
}

export const STORY_STATIC_DURATION_MS = 6_000;

/** Duração máxima (segundos) de qualquer story — vídeo ou música são cortados aqui. */
export const STORY_MAX_DURATION_SEC = 30;

/** Compara IDs de utilizadora (API pode devolver string ou número serializado). */
export function isSameUserId(a: string | null | undefined, b: string | null | undefined): boolean {
  if (a == null || b == null) return false;
  return String(a) === String(b);
}
