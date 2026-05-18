import type { User } from "@/domain/types";

export type StoryMediaType = "image" | "video" | "text";

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
}
