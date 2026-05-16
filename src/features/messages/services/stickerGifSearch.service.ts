import { api, getApiErrorMessage } from "@/lib/api";
import type { StickerGifSearchResponseDto } from "../types";

export async function searchMessagingStickerGifs(
  q?: string,
  limit = 24,
  signal?: AbortSignal
): Promise<StickerGifSearchResponseDto> {
  try {
    const { data } = await api.get<StickerGifSearchResponseDto>("/messaging/sticker-gifs", {
      params: { q: q?.trim() || undefined, limit },
      signal,
    });
    return data;
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível pesquisar GIFs e stickers."));
  }
}
