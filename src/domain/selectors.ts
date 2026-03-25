import type { Community, Membership, Post, PostCommunityPreview, User } from "./types";
import { SEED_COMMUNITIES, SEED_MEMBERSHIPS, SEED_POSTS, SEED_USERS, type SeedPost } from "./mocks/seed";

const communityById = new Map(SEED_COMMUNITIES.map((c) => [c.id, c]));

export function getUserById(userId: string): User | undefined {
  return SEED_USERS.find((u) => u.id === userId);
}

export function getCommunityById(id: string): Community | undefined {
  return communityById.get(id);
}

export function getCommunityBySlug(slug: string): Community | undefined {
  return SEED_COMMUNITIES.find((c) => c.slug === slug);
}

export function postCommunityPreviewFromCommunity(c: Community): PostCommunityPreview {
  return { id: c.id, slug: c.slug, name: c.name };
}

export function getPostCommunityPreview(communityId: string): PostCommunityPreview | undefined {
  const c = getCommunityById(communityId);
  return c ? postCommunityPreviewFromCommunity(c) : undefined;
}

export function enrichPost(raw: SeedPost): Post {
  return {
    id: raw.id,
    communityId: raw.communityId,
    author: raw.author,
    title: raw.title,
    content: raw.content,
    imageUrl: raw.imageUrl,
    tags: raw.tags ? [...raw.tags] : undefined,
    createdAt: raw.createdAt,
    likesCount: raw.likesCount,
    commentsCount: raw.commentsCount,
    community: getPostCommunityPreview(raw.communityId),
  };
}

export function getAllSeedPostsEnriched(): Post[] {
  return SEED_POSTS.map((p) => enrichPost(p));
}

export function getPostsByCommunityId(communityId: string): Post[] {
  return SEED_POSTS.filter((p) => p.communityId === communityId).map((p) => enrichPost(p));
}

export function getPostsByAuthorId(authorId: string): Post[] {
  return SEED_POSTS.filter((p) => p.author.id === authorId).map((p) => enrichPost(p));
}

export function getMembershipsForUser(userId: string): Membership[] {
  return SEED_MEMBERSHIPS.filter((m) => m.userId === userId);
}

export function getCommunityIdsForUser(userId: string): string[] {
  return getMembershipsForUser(userId).map((m) => m.communityId);
}

export function getCommunitiesForUser(userId: string): Community[] {
  const idSet = new Set(getCommunityIdsForUser(userId));
  return SEED_COMMUNITIES.filter((c) => idSet.has(c.id));
}
