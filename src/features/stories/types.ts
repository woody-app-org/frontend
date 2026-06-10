import type { User } from "@/domain/types";
import type { SharedPostPreviewDto } from "@/features/messages/types";

export type StoryMediaType = "image" | "video" | "text" | "shared_post";

export interface StoryMusic {
  provider: string;
  trackId: string;
  title: string;
  artist: string;
  previewUrl: string;
  coverUrl: string;
  startTime: number;
}

/** Entrada da barra horizontal de stories no feed (`GET /stories/feed`). */
export interface StoryFeedItem {
  userId: string;
  displayName: string;
  username: string;
  avatarUrl?: string | null;
  hasActiveStories: boolean;
  hasUnviewedStories: boolean;
  lastStoryCreatedAt?: string | null;
  isSelf?: boolean;
}

export interface StoryViewer {
  userId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  viewedAt: string;
}

export type StoryLayerType = "text" | "image" | "video";
export type StoryLayerFontSize = "sm" | "md" | "lg";

export interface StoryLayer {
  /** Gerado no client (crypto.randomUUID()) só para key/seleção; removido antes de enviar ao backend. */
  id: string;
  type: StoryLayerType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  text?: string;
  color?: string;
  fontSize?: StoryLayerFontSize;
  mediaUrl?: string;
}

export interface Story {
  id: string;
  authorUserId: string;
  author: User;
  mediaType: StoryMediaType;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  text: string | null;
  backgroundColor: string | null;
  createdAt: string;
  expiresAt: string;
  viewCount: number;
  hasViewedByMe: boolean;
  likesCount: number;
  likedByCurrentUser: boolean;
  music: StoryMusic | null;
  sharedPost?: SharedPostPreviewDto | null;
  overlayText?: string | null;
  overlayTextX?: number | null;
  overlayTextY?: number | null;
  overlayTextColor?: string | null;
  contentScale?: number | null;
  layers?: StoryLayer[] | null;
}
