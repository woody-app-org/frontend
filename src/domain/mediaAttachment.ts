/** Valores alinhados à API Woody (`MediaKindApi`). */
export type WoodyMediaType = "image" | "video" | "gif" | "sticker";

export function isWoodyMediaType(v: string): v is WoodyMediaType {
  return v === "image" || v === "video" || v === "gif" || v === "sticker";
}

export interface PostMediaAttachment {
  url: string;
  mediaType: WoodyMediaType;
  mimeType?: string | null;
  durationSeconds?: number | null;
}
