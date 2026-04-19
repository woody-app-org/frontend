import type { Community, CommunityCategory, CommunityVisibility } from "@/domain/types";

/** Payload alinhado a futuro `PATCH /communities/:id`. */
export interface CommunityUpdatePayload {
  name: string;
  description: string;
  category: CommunityCategory;
  tags: string[];
  rules: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  visibility: CommunityVisibility;
}

export type CommunityUpdateResult =
  | { ok: true; community: Community }
  | { ok: false; error: string };

/** Corpo de `POST /communities` (alinhado ao DTO da API). */
export interface CreateCommunityPayload {
  name: string;
  description: string;
  category: CommunityCategory;
  tags: string[];
  rules: string;
  visibility: CommunityVisibility;
  avatarUrl?: string | null;
  coverUrl?: string | null;
}
