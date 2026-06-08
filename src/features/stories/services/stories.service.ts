import axios from "axios";
import { mapUserFromApi } from "@/lib/apiMappers";
import { api, getApiErrorMessage } from "@/lib/api";
import { getStoredToken } from "@/features/auth/authTokenStorage";
import type { Story, StoryFeedItem, StoryMediaType } from "../types";
import { filterActiveStories, parseStoryMediaType } from "../lib/storyUtils";

const STORY_LIMIT_REACHED_CODE = "STORY_LIMIT_REACHED";

export class StoryLimitReachedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoryLimitReachedError";
  }
}

export interface CreateStoryMusicPayload {
  trackId: string;
  title: string;
  artist: string;
  previewUrl: string;
  coverUrl: string;
  startTime: number;
}

export interface CreateStoryPayload {
  mediaType: StoryMediaType;
  mediaUrl?: string;
  thumbnailUrl?: string;
  storageKey?: string;
  text?: string;
  backgroundColor?: string;
  music?: CreateStoryMusicPayload;
}

const STORY_LIMIT_MESSAGE =
  "Você já tem 3 stories ativos. Quando um expirar, você pode publicar outro.";

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
    likesCount: Number(raw.likesCount ?? 0),
    likedByCurrentUser: Boolean(raw.likedByCurrentUser),
    music: raw.musicTrackId
      ? {
          provider: asString(raw.musicProvider),
          trackId: asString(raw.musicTrackId),
          title: asString(raw.musicTitle),
          artist: asString(raw.musicArtist),
          previewUrl: asString(raw.musicPreviewUrl),
          coverUrl: asString(raw.musicCoverUrl),
          startTime: Number(raw.musicStartTime ?? 0),
        }
      : null,
  };
}

export function mapStoryFeedItemFromApi(raw: ApiRecord): StoryFeedItem {
  return {
    userId: asString(raw.userId),
    displayName: asString(raw.displayName),
    username: asString(raw.username),
    avatarUrl: raw.avatarUrl != null ? asString(raw.avatarUrl) : null,
    hasActiveStories: raw.hasActiveStories !== false,
    hasUnviewedStories: Boolean(raw.hasUnviewedStories),
    lastStoryCreatedAt: raw.lastStoryCreatedAt != null ? asString(raw.lastStoryCreatedAt) : null,
    isSelf: Boolean(raw.isSelf),
  };
}

export async function fetchStoriesFeed(): Promise<StoryFeedItem[]> {
  try {
    const { data } = await api.get("/stories/feed");
    const list = Array.isArray(data) ? data : [];
    return list.map((row) => mapStoryFeedItemFromApi(row as ApiRecord));
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível carregar os stories."));
  }
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

export async function createStory(payload: CreateStoryPayload): Promise<Story> {
  try {
    const { music, ...rest } = payload;
    const body = music
      ? {
          ...rest,
          musicTrackId: music.trackId,
          musicTitle: music.title,
          musicArtist: music.artist,
          musicPreviewUrl: music.previewUrl,
          musicCoverUrl: music.coverUrl,
          musicStartTime: music.startTime,
        }
      : rest;
    const { data } = await api.post("/stories", body);
    return mapStoryFromApi(data as ApiRecord);
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 409) {
      const body = e.response.data as { code?: string; error?: string } | undefined;
      if (body?.code === STORY_LIMIT_REACHED_CODE) {
        throw new StoryLimitReachedError(body.error?.trim() || STORY_LIMIT_MESSAGE);
      }
    }
    throw new Error(getApiErrorMessage(e, "Não foi possível publicar o story."));
  }
}

/** Remove story (apenas autora; validação no servidor). */
export async function deleteStory(storyId: string): Promise<void> {
  try {
    await api.delete(`/stories/${encodeURIComponent(storyId)}`);
  } catch (e) {
    if (axios.isAxiosError(e) && (e.response?.status === 403 || e.response?.status === 404)) {
      throw new Error("Não foi possível excluir este story.");
    }
    throw new Error(getApiErrorMessage(e, "Não foi possível excluir este story."));
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

export interface StoryLikeMutationResult {
  likesCount: number;
  likedByCurrentUser: boolean;
}

function mapStoryLikeMutationFromApi(raw: ApiRecord): StoryLikeMutationResult {
  return {
    likesCount: Number(raw.likesCount ?? 0),
    likedByCurrentUser: Boolean(raw.likedByCurrentUser),
  };
}

/** Curte o story (idempotente no servidor; um segundo like não duplica). */
export async function likeStory(storyId: string): Promise<StoryLikeMutationResult> {
  try {
    const { data } = await api.post(`/stories/${encodeURIComponent(storyId)}/like`);
    return mapStoryLikeMutationFromApi(data as ApiRecord);
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível curtir este story."));
  }
}

/** Remove o like do story (idempotente no servidor). */
export async function unlikeStory(storyId: string): Promise<StoryLikeMutationResult> {
  try {
    const { data } = await api.delete(`/stories/${encodeURIComponent(storyId)}/like`);
    return mapStoryLikeMutationFromApi(data as ApiRecord);
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível remover a curtida deste story."));
  }
}

export interface ShareStoryToConversationPayload {
  recipientUserId?: number;
  conversationId?: number;
  message?: string;
}

export interface ShareStoryToConversationResult {
  conversationId: number;
  message: ApiRecord;
}

const GENERIC_STORY_SHARE_ERROR = "Não foi possível enviar este story.";

/** Envia o story por mensagem direta (referenciando-o como preview no chat). */
export async function shareStoryToConversation(
  storyId: string,
  payload: ShareStoryToConversationPayload
): Promise<ShareStoryToConversationResult> {
  try {
    const { data } = await api.post(`/stories/${encodeURIComponent(storyId)}/share-to-conversation`, payload);
    return data as ShareStoryToConversationResult;
  } catch (e) {
    throw new Error(getApiErrorMessage(e, GENERIC_STORY_SHARE_ERROR));
  }
}
