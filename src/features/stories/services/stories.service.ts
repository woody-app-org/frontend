import { mapUserFromApi } from "@/lib/apiMappers";
import { api, getApiErrorMessage } from "@/lib/api";
import { getStoredToken } from "@/features/auth/authTokenStorage";
import type { Story } from "../types";
import { filterActiveStories, parseStoryMediaType } from "../lib/storyUtils";

type ApiRecord = Record<string, unknown>;

function asString(v: unknown): string {
  return v == null ? "" : String(v);
}

export function mapStoryFromApi(raw: ApiRecord): Story {
  const authorRaw = (raw.author ?? {}) as ApiRecord;
  return {
    id: asString(raw.id),
    authorUserId: asString(raw.authorUserId),
    author: mapUserFromApi(authorRaw),
    mediaType: parseStoryMediaType(raw.mediaType),
    mediaUrl: raw.mediaUrl != null ? asString(raw.mediaUrl) : null,
    thumbnailUrl: raw.thumbnailUrl != null ? asString(raw.thumbnailUrl) : null,
    text: raw.text != null ? asString(raw.text) : null,
    backgroundColor: raw.backgroundColor != null ? asString(raw.backgroundColor) : null,
    createdAt: asString(raw.createdAt),
    expiresAt: asString(raw.expiresAt),
    viewCount: Number(raw.viewCount ?? 0),
    hasViewedByMe: Boolean(raw.hasViewedByMe),
  };
}

export async function fetchUserStories(userId: string): Promise<Story[]> {
  try {
    const { data } = await api.get(`/users/${encodeURIComponent(userId)}/stories`);
    const list = Array.isArray(data) ? data : [];
    const mapped = list.map((row) => mapStoryFromApi(row as ApiRecord));
    return filterActiveStories(mapped);
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível carregar os stories."));
  }
}

/** Regista visualização (requer sessão). Falhas são ignoradas. */
export async function markStoryViewed(storyId: string): Promise<void> {
  if (!getStoredToken()) return;
  try {
    await api.post(`/stories/${encodeURIComponent(storyId)}/view`);
  } catch {
    // idempotente no servidor; não bloquear o viewer
  }
}
