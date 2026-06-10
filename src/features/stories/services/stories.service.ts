import axios from "axios";
import { mapUserFromApi } from "@/lib/apiMappers";
import { api, getApiErrorMessage } from "@/lib/api";
import { getStoredToken } from "@/features/auth/authTokenStorage";
import type { SharedPostPreviewDto } from "@/features/messages/types";
import type { Story, StoryFeedItem, StoryLayer, StoryMediaType, StoryViewer } from "../types";
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

export interface StoryOverlayPayload {
  text: string;
  x: number;
  y: number;
  color: string;
}

export interface CreateStoryPayload {
  mediaType: StoryMediaType;
  mediaUrl?: string;
  thumbnailUrl?: string;
  storageKey?: string;
  text?: string;
  backgroundColor?: string;
  music?: CreateStoryMusicPayload;
  overlay?: StoryOverlayPayload;
  contentScale?: number;
  layers?: StoryLayer[];
}

function mapStoryLayerFromApi(raw: ApiRecord): StoryLayer {
  return {
    id: crypto.randomUUID(),
    type: (raw.type as StoryLayer["type"]) ?? "text",
    x: Number(raw.x ?? 0.5),
    y: Number(raw.y ?? 0.5),
    width: Number(raw.width ?? 0.4),
    height: Number(raw.height ?? 0.1),
    rotation: Number(raw.rotation ?? 0),
    text: raw.text != null ? asString(raw.text) : undefined,
    color: raw.color != null ? asString(raw.color) : undefined,
    fontSize: raw.fontSize != null ? (asString(raw.fontSize) as StoryLayer["fontSize"]) : undefined,
    mediaUrl: raw.mediaUrl != null ? asString(raw.mediaUrl) : undefined,
  };
}

function mapStoryLayersToApi(layers: StoryLayer[] | undefined): Record<string, unknown>[] | undefined {
  if (!layers || layers.length === 0) return undefined;
  return layers.map(({ id: _id, ...rest }) => rest);
}

const STORY_LIMIT_MESSAGE =
  "Você já tem 3 stories ativos. Quando um expirar, você pode publicar outro.";

type ApiRecord = Record<string, unknown>;

function asString(v: unknown): string {
  return v == null ? "" : String(v);
}

function mapSharedPostPreviewFromApi(raw: ApiRecord): SharedPostPreviewDto {
  return {
    id: raw.id != null ? asString(raw.id) : null,
    publicId: raw.publicId != null ? asString(raw.publicId) : null,
    authorDisplayName: raw.authorDisplayName != null ? asString(raw.authorDisplayName) : null,
    authorUsername: raw.authorUsername != null ? asString(raw.authorUsername) : null,
    authorProfilePic: raw.authorProfilePic != null ? asString(raw.authorProfilePic) : null,
    contentPreview: raw.contentPreview != null ? asString(raw.contentPreview) : null,
    firstMediaUrl: raw.firstMediaUrl != null ? asString(raw.firstMediaUrl) : null,
    firstMediaType: raw.firstMediaType != null ? asString(raw.firstMediaType) : null,
    communityName: raw.communityName != null ? asString(raw.communityName) : null,
    isUnavailable: Boolean(raw.isUnavailable),
  };
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
    sharedPost: raw.sharedPost != null ? mapSharedPostPreviewFromApi(raw.sharedPost as ApiRecord) : null,
    overlayText: raw.overlayText != null ? asString(raw.overlayText) : null,
    overlayTextX: raw.overlayTextX != null ? Number(raw.overlayTextX) : null,
    overlayTextY: raw.overlayTextY != null ? Number(raw.overlayTextY) : null,
    overlayTextColor: raw.overlayTextColor != null ? asString(raw.overlayTextColor) : null,
    contentScale: raw.contentScale != null ? Number(raw.contentScale) : null,
    layers: Array.isArray(raw.layers) ? (raw.layers as ApiRecord[]).map(mapStoryLayerFromApi) : null,
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
    const { music, overlay, layers, ...rest } = payload;
    const body: Record<string, unknown> = { ...rest };
    const layersBody = mapStoryLayersToApi(layers);
    if (layersBody) body.layers = layersBody;
    if (music) {
      body.musicTrackId = music.trackId;
      body.musicTitle = music.title;
      body.musicArtist = music.artist;
      body.musicPreviewUrl = music.previewUrl;
      body.musicCoverUrl = music.coverUrl;
      body.musicStartTime = music.startTime;
    }
    if (overlay) {
      body.overlayText = overlay.text;
      body.overlayTextX = overlay.x;
      body.overlayTextY = overlay.y;
      body.overlayTextColor = overlay.color;
    }
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

/** Compartilha um post no story da utilizadora atual. */
export async function sharePostToStory(
  postId: string,
  music?: CreateStoryMusicPayload,
  overlay?: StoryOverlayPayload,
  contentScale?: number,
  layers?: StoryLayer[],
  backgroundColor?: string
): Promise<Story> {
  try {
    const body: Record<string, unknown> = {};
    const layersBody = mapStoryLayersToApi(layers);
    if (layersBody) body.layers = layersBody;
    if (music) {
      body.musicTrackId = music.trackId;
      body.musicTitle = music.title;
      body.musicArtist = music.artist;
      body.musicPreviewUrl = music.previewUrl;
      body.musicCoverUrl = music.coverUrl;
      body.musicStartTime = music.startTime;
    }
    if (overlay) {
      body.overlayText = overlay.text;
      body.overlayTextX = overlay.x;
      body.overlayTextY = overlay.y;
      body.overlayTextColor = overlay.color;
    }
    if (contentScale != null) body.contentScale = contentScale;
    if (backgroundColor) body.backgroundColor = backgroundColor;
    const { data } = await api.post(`/posts/${encodeURIComponent(postId)}/share-to-story`, Object.keys(body).length ? body : undefined);
    return mapStoryFromApi(data as ApiRecord);
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 409) {
      const body = e.response.data as { code?: string; error?: string } | undefined;
      if (body?.code === STORY_LIMIT_REACHED_CODE) {
        throw new StoryLimitReachedError(body.error?.trim() || STORY_LIMIT_MESSAGE);
      }
    }
    throw new Error(getApiErrorMessage(e, "Não foi possível compartilhar no story."));
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

function mapStoryViewerFromApi(raw: ApiRecord): StoryViewer {
  return {
    userId: asString(raw.viewerUserId),
    displayName: asString(raw.displayName),
    username: asString(raw.username),
    avatarUrl: raw.avatarUrl != null ? asString(raw.avatarUrl) : null,
    viewedAt: asString(raw.viewedAt),
  };
}

/** Lista quem visualizou o story (apenas a autora pode consultar). */
export async function fetchStoryViewers(storyId: string): Promise<StoryViewer[]> {
  try {
    const { data } = await api.get(`/stories/${encodeURIComponent(storyId)}/views`);
    const list = Array.isArray(data) ? data : [];
    return list.map((row) => mapStoryViewerFromApi(row as ApiRecord));
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível carregar quem viu este story."));
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
