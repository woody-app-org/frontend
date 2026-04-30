/** Valores alinhados à API Woody (`MediaKindApi`). */
export type WoodyMediaType = "image" | "video" | "gif" | "sticker";

export function isWoodyMediaType(v: string): v is WoodyMediaType {
  return v === "image" || v === "video" || v === "gif" || v === "sticker";
}

export interface PostMediaAttachment {
  url: string;
  mediaType: WoodyMediaType;
  /** Chave interna Woody (ex.: posts/…/….png) quando a API a devolve. */
  storageKey?: string | null;
  mimeType?: string | null;
  thumbnailUrl?: string | null;
  durationSeconds?: number | null;
  durationMs?: number | null;
}
