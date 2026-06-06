import type { User } from "@/domain/types";

export type StoryMediaType = "image" | "video" | "text";

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
  music: StoryMusic | null;
}
