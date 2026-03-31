import type { Community, JoinRequest, Membership, Post, PostCommunityPreview, User } from "./types";
import { getCommunityDraft } from "./mocks/communityDraftStore";
import { getJoinRequestRows, getMembershipRows } from "./mocks/membershipMockStore";
import { SEED_COMMUNITIES, SEED_FOLLOWS, SEED_POSTS, SEED_USERS, type SeedPost } from "./mocks/seed";
import { getUserDisplayPatch } from "./mocks/userDisplayPatchStore";

const communityById = new Map(SEED_COMMUNITIES.map((c) => [c.id, c]));

function mergeUserWithDisplayPatch(base: User, patch: NonNullable<ReturnType<typeof getUserDisplayPatch>>): User {
  return {
    ...base,
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.username !== undefined ? { username: patch.username } : {}),
    ...(patch.avatarUrl !== undefined ? { avatarUrl: patch.avatarUrl } : {}),
    ...(patch.bio !== undefined ? { bio: patch.bio } : {}),
    ...(patch.pronouns !== undefined ? { pronouns: patch.pronouns } : {}),
  };
}

export function getUserById(userId: string): User | undefined {
  const base = SEED_USERS.find((u) => u.id === userId);
  if (!base) return undefined;
  const patch = getUserDisplayPatch(userId);
  return patch ? mergeUserWithDisplayPatch(base, patch) : base;
}

function mergeCommunityWithDraft(base: Community): Community {
  const draft = getCommunityDraft(base.id);
  const src = draft ?? base;
  return { ...src, tags: [...src.tags] };
}

export function getCommunityById(id: string): Community | undefined {
  const base = communityById.get(id);
  if (!base) return undefined;
  return mergeCommunityWithDraft(base);
}

export function getCommunityBySlug(slug: string): Community | undefined {
  const base = SEED_COMMUNITIES.find((c) => c.slug === slug);
  if (!base) return undefined;
  return mergeCommunityWithDraft(base);
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
  const author = getUserById(raw.author.id) ?? raw.author;
  return {
    id: raw.id,
    communityId: raw.communityId,
    author,
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
  return getMembershipRows().filter((m) => m.userId === userId);
}

/** Filiações ativas (aparecem como membro da comunidade). */
export function getActiveMembershipsForUser(userId: string): Membership[] {
  return getMembershipsForUser(userId).filter((m) => m.status === "active");
}

export function getMembershipForUserInCommunity(
  userId: string,
  communityId: string
): Membership | undefined {
  return getMembershipRows().find((m) => m.userId === userId && m.communityId === communityId);
}

/** Todas as filiações da comunidade (ativas, pendentes, banidas, etc.). */
export function getMembershipsInCommunity(communityId: string): Membership[] {
  return getMembershipRows().filter((m) => m.communityId === communityId);
}

export function getActiveMemberCountForCommunity(communityId: string): number {
  return getMembershipRows().filter((m) => m.communityId === communityId && m.status === "active").length;
}

export function getCommunityIdsForUser(userId: string): string[] {
  return getActiveMembershipsForUser(userId).map((m) => m.communityId);
}

export function getCommunitiesForUser(userId: string): Community[] {
  const idSet = new Set(getCommunityIdsForUser(userId));
  return SEED_COMMUNITIES.filter((c) => idSet.has(c.id))
    .map((c) => getCommunityById(c.id))
    .filter((c): c is Community => c != null);
}

export function getCommunitiesOwnedByUser(userId: string): Community[] {
  return SEED_COMMUNITIES.filter((c) => c.ownerUserId === userId)
    .map((c) => getCommunityById(c.id))
    .filter((c): c is Community => c != null);
}

export function isUserMemberOfCommunity(userId: string, communityId: string): boolean {
  const m = getMembershipForUserInCommunity(userId, communityId);
  return m?.status === "active";
}

export function getJoinRequestsForCommunity(communityId: string): JoinRequest[] {
  return getJoinRequestRows().filter((r) => r.communityId === communityId);
}

export function getPendingJoinRequestsForCommunity(communityId: string): JoinRequest[] {
  return getJoinRequestsForCommunity(communityId).filter((r) => r.status === "pending");
}

export function getJoinRequestForUserInCommunity(
  userId: string,
  communityId: string
): JoinRequest | undefined {
  return getJoinRequestRows().find((r) => r.userId === userId && r.communityId === communityId);
}

/** IDs de usuárias que `followerId` segue (mock). */
export function getFollowingUserIds(followerId: string): string[] {
  return [...new Set(SEED_FOLLOWS.filter((f) => f.followerId === followerId).map((f) => f.followingId))];
}

/** Usuárias que participam da comunidade (mock por membership ativa; futuro: API). */
export function getCommunityMemberUsers(communityId: string): User[] {
  const ids = [
    ...new Set(
      getMembershipRows()
        .filter((m) => m.communityId === communityId && m.status === "active")
        .map((m) => m.userId)
    ),
  ];
  return ids.map((id) => getUserById(id)).filter((u): u is User => u != null);
}
