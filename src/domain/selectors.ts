import type { Community, JoinRequest, Membership, Post, PostCommunityPreview, User } from "./types";
import {
  SEED_COMMUNITIES,
  SEED_FOLLOWS,
  SEED_JOIN_REQUESTS,
  SEED_MEMBERSHIPS,
  SEED_POSTS,
  SEED_USERS,
  type SeedPost,
} from "./mocks/seed";

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
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    avatarUrl: c.avatarUrl,
    category: c.category,
  };
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

/** Posts recentes apenas das comunidades em que a usuária participa (mock). */
export function getRecentPostsInUserCommunities(userId: string, limit = 5): Post[] {
  const allowed = new Set(getCommunityIdsForUser(userId));
  return getAllSeedPostsEnriched().filter((p) => allowed.has(p.communityId)).slice(0, limit);
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

/** Filiações ativas (aparecem como membro da comunidade). */
export function getActiveMembershipsForUser(userId: string): Membership[] {
  return getMembershipsForUser(userId).filter((m) => m.status === "active");
}

export function getMembershipForUserInCommunity(
  userId: string,
  communityId: string
): Membership | undefined {
  return SEED_MEMBERSHIPS.find((m) => m.userId === userId && m.communityId === communityId);
}

export function getCommunityIdsForUser(userId: string): string[] {
  return getActiveMembershipsForUser(userId).map((m) => m.communityId);
}

export function getCommunitiesForUser(userId: string): Community[] {
  const idSet = new Set(getCommunityIdsForUser(userId));
  return SEED_COMMUNITIES.filter((c) => idSet.has(c.id));
}

export function getCommunitiesOwnedByUser(userId: string): Community[] {
  return SEED_COMMUNITIES.filter((c) => c.ownerUserId === userId);
}

export function isUserMemberOfCommunity(userId: string, communityId: string): boolean {
  const m = getMembershipForUserInCommunity(userId, communityId);
  return m?.status === "active";
}

export function getJoinRequestsForCommunity(communityId: string): JoinRequest[] {
  return SEED_JOIN_REQUESTS.filter((r) => r.communityId === communityId);
}

export function getPendingJoinRequestsForCommunity(communityId: string): JoinRequest[] {
  return getJoinRequestsForCommunity(communityId).filter((r) => r.status === "pending");
}

export function getJoinRequestForUserInCommunity(
  userId: string,
  communityId: string
): JoinRequest | undefined {
  return SEED_JOIN_REQUESTS.find((r) => r.userId === userId && r.communityId === communityId);
}

/** IDs de usuárias que `followerId` segue (mock). */
export function getFollowingUserIds(followerId: string): string[] {
  return [...new Set(SEED_FOLLOWS.filter((f) => f.followerId === followerId).map((f) => f.followingId))];
}

/** Usuárias que participam da comunidade (mock por membership ativa; futuro: API). */
export function getCommunityMemberUsers(communityId: string): User[] {
  const ids = [
    ...new Set(
      SEED_MEMBERSHIPS.filter((m) => m.communityId === communityId && m.status === "active").map((m) => m.userId)
    ),
  ];
  return ids.map((id) => getUserById(id)).filter((u): u is User => u != null);
}
