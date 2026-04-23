import {
  compareActiveMembershipsByHierarchy,
  resolveEffectiveCommunityRole,
} from "./communityMemberRole";
import type {
  Comment,
  Community,
  CommunityMemberListItem,
  CommunityMemberRole,
  JoinRequest,
  Membership,
  Post,
  PostCommunityPreview,
  PostPublicationContext,
  User,
} from "./types";
import { getCommunityDraft } from "./mocks/communityDraftStore";
import { getJoinRequestRows, getMembershipRows } from "./mocks/membershipMockStore";
import {
  getMutableCommentRows,
  getMutablePostRows,
  getSeedPostRowById,
  isPostLikedByUser,
} from "./mocks/postInteractionMockStore";
import { SEED_COMMUNITIES, SEED_FOLLOWS, SEED_USERS, type SeedComment, type SeedPost } from "./mocks/seed";
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
  const plan = c.billing?.effectivePlan ?? c.billing?.billingPlan;
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    avatarUrl: c.avatarUrl,
    category: c.category,
    communityPlan: plan === "premium" ? "premium" : "free",
  };
}

export function getPostCommunityPreview(communityId: string): PostCommunityPreview | undefined {
  const c = getCommunityById(communityId);
  return c ? postCommunityPreviewFromCommunity(c) : undefined;
}

function isSeedPostRowVisible(raw: SeedPost): boolean {
  return raw.deletedAt == null || raw.deletedAt === "";
}

export function enrichPost(raw: SeedPost, viewerId?: string): Post {
  const authorId = raw.authorId ?? raw.author.id;
  const author = getUserById(authorId) ?? raw.author;
  const likedByCurrentUser = viewerId != null && viewerId !== "" ? isPostLikedByUser(viewerId, raw.id) : false;
  const publicationContext: PostPublicationContext = raw.publicationContext ?? "community";
  const communityId = publicationContext === "profile" ? null : raw.communityId;
  return {
    id: raw.id,
    publicationContext,
    communityId,
    authorId,
    author,
    title: raw.title,
    content: raw.content,
    imageUrl: raw.imageUrl,
    tags: raw.tags ? [...raw.tags] : undefined,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    deletedAt: raw.deletedAt,
    likesCount: raw.likesCount,
    commentsCount: raw.commentsCount,
    likedByCurrentUser,
    community:
      publicationContext === "profile" || communityId == null
        ? undefined
        : getPostCommunityPreview(communityId),
  };
}

export interface EnrichCommentOptions {
  viewerId?: string;
  /** Obrigatório para calcular `contentModerationMask` quando há ocultação. */
  postAuthorId: string;
}

export function enrichComment(raw: SeedComment, options: EnrichCommentOptions): Comment {
  const author = getUserById(raw.authorId);
  if (!author) {
    throw new Error(`enrichComment: usuária ${raw.authorId} não encontrada no seed`);
  }

  let contentModerationMask: Comment["contentModerationMask"];
  if (raw.hiddenByPostAuthorAt && options.viewerId != null && options.viewerId !== "") {
    const v = options.viewerId;
    if (options.postAuthorId !== v && raw.authorId !== v) {
      contentModerationMask = "hidden_by_post_author";
    }
  }

  return {
    id: raw.id,
    postId: raw.postId,
    parentCommentId: raw.parentCommentId,
    authorId: raw.authorId,
    author,
    content: raw.content,
    createdAt: raw.createdAt,
    deletedAt: raw.deletedAt,
    hiddenByPostAuthorAt: raw.hiddenByPostAuthorAt,
    contentModerationMask,
  };
}

/** Lista comentários do mock, ordenados do mais antigo ao mais recente. */
export function getCommentsEnrichedByPostId(postId: string, viewerId?: string): Comment[] {
  const post = getSeedPostRowById(postId);
  const postAuthorId = post?.authorId ?? "";
  return getMutableCommentRows()
    .filter((c) => c.postId === postId && (c.deletedAt == null || c.deletedAt === ""))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((c) => enrichComment(c, { viewerId, postAuthorId }));
}

/** Respostas diretas de um comentário (ordenadas por data). */
export function getRepliesEnrichedByCommentId(parentCommentId: string, viewerId?: string): Comment[] {
  const comments = getMutableCommentRows();
  const parent = comments.find((c) => c.id === parentCommentId);
  const postAuthorId = parent ? getSeedPostRowById(parent.postId)?.authorId ?? "" : "";
  return comments
    .filter((c) => c.parentCommentId === parentCommentId && (c.deletedAt == null || c.deletedAt === ""))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((c) => enrichComment(c, { viewerId, postAuthorId }));
}

export function getPostById(postId: string, viewerId?: string): Post | undefined {
  const raw = getSeedPostRowById(postId);
  if (!raw || !isSeedPostRowVisible(raw)) return undefined;
  return enrichPost(raw, viewerId);
}

export function getAllSeedPostsEnriched(viewerId?: string): Post[] {
  return getMutablePostRows()
    .filter(isSeedPostRowVisible)
    .map((p) => enrichPost(p, viewerId));
}

/** Posts recentes apenas das comunidades em que a usuária participa (mock). */
export function getRecentPostsInUserCommunities(userId: string, limit = 5, viewerId?: string): Post[] {
  const allowed = new Set(getCommunityIdsForUser(userId));
  const vid = viewerId ?? userId;
  return getAllSeedPostsEnriched(vid)
    .filter((p) => p.communityId != null && allowed.has(p.communityId))
    .slice(0, limit);
}

export function getPostsByCommunityId(communityId: string, viewerId?: string): Post[] {
  return getMutablePostRows()
    .filter((p) => p.communityId === communityId)
    .filter(isSeedPostRowVisible)
    .map((p) => enrichPost(p, viewerId));
}

export function getPostsByAuthorId(authorId: string, viewerId?: string): Post[] {
  return getMutablePostRows()
    .filter((p) => p.authorId === authorId)
    .filter(isSeedPostRowVisible)
    .map((p) => enrichPost(p, viewerId));
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

/** Papel efetivo da usuária na comunidade (só memberships ativas). */
export function getViewerCommunityRole(userId: string, community: Community): CommunityMemberRole | undefined {
  const m = getMembershipForUserInCommunity(userId, community.id);
  if (!m || m.status !== "active") return undefined;
  return resolveEffectiveCommunityRole(m, community);
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

/**
 * Participantes ativos ordenados: criadora, admins, demais membros (mock/API).
 */
export function getCommunityMemberListItems(communityId: string): CommunityMemberListItem[] {
  const community = getCommunityById(communityId);
  if (!community) return [];
  const active = getMembershipRows().filter((m) => m.communityId === communityId && m.status === "active");
  active.sort((a, b) => compareActiveMembershipsByHierarchy(a, b, community));
  const items: CommunityMemberListItem[] = [];
  for (const m of active) {
    const user = getUserById(m.userId);
    if (!user) continue;
    items.push({ user, role: resolveEffectiveCommunityRole(m, community) });
  }
  return items;
}

/** @deprecated Prefira `getCommunityMemberListItems` quando precisar do papel. Ordem: owner → admin → member. */
export function getCommunityMemberUsers(communityId: string): User[] {
  return getCommunityMemberListItems(communityId).map((row) => row.user);
}
