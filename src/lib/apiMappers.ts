import type { Comment, Community, CommunityCategory, Post, User } from "@/domain/types";
import type { SocialLink, UserProfile } from "@/features/profile/types";
import { formatDisplayDateTimeFromIso } from "@/lib/formatIsoDate";

const PLATFORMS = new Set(["instagram", "facebook", "twitter", "tiktok", "linkedin", "other"]);

function mapSocialPlatform(raw: string): SocialLink["platform"] {
  const p = raw.toLowerCase();
  return PLATFORMS.has(p) ? (p as SocialLink["platform"]) : "other";
}

/** Respostas camelCase da API Woody (.NET). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiRecord = Record<string, any>;

function asString(v: unknown): string {
  return v == null ? "" : String(v);
}

export function mapUserFromApi(raw: ApiRecord): User {
  return {
    id: asString(raw.id),
    name: asString(raw.name ?? raw.username),
    username: asString(raw.username),
    avatarUrl: raw.avatarUrl ?? null,
    bio: raw.bio ?? undefined,
    pronouns: raw.pronouns ?? undefined,
  };
}

export function mapCommunityFromApi(raw: ApiRecord): Community {
  const cat = asString(raw.category) as CommunityCategory;
  const safeCategory: CommunityCategory =
    cat === "bemestar" || cat === "carreira" || cat === "cultura" || cat === "seguranca" || cat === "outro"
      ? cat
      : "outro";

  return {
    id: asString(raw.id),
    slug: asString(raw.slug),
    name: asString(raw.name),
    description: asString(raw.description ?? ""),
    category: safeCategory,
    tags: Array.isArray(raw.tags) ? raw.tags.map((t: unknown) => String(t)) : [],
    rules: asString(raw.rules ?? ""),
    avatarUrl: raw.avatarUrl ?? null,
    coverUrl: raw.coverUrl ?? null,
    ownerUserId: asString(raw.ownerUserId),
    visibility: raw.visibility === "private" ? "private" : "public",
    memberCount: Number(raw.memberCount ?? 0),
  };
}

export function mapPostFromApi(raw: ApiRecord, _viewerId: string): Post {
  const author = mapUserFromApi(raw.author ?? {});
  const comm = raw.community ? mapCommunityPreviewFromApi(raw.community) : undefined;
  const imageUrls = Array.isArray(raw.imageUrls) ? raw.imageUrls.map((u: unknown) => String(u)) : undefined;
  const primaryImage =
    imageUrls && imageUrls.length > 0 ? imageUrls[0] : (raw.imageUrl != null ? String(raw.imageUrl) : null);
  return {
    id: asString(raw.id),
    communityId: asString(raw.communityId),
    authorId: asString(raw.authorId),
    author,
    title: asString(raw.title),
    content: asString(raw.content),
    imageUrl: primaryImage || null,
    imageUrls: imageUrls && imageUrls.length > 0 ? imageUrls : undefined,
    tags: Array.isArray(raw.tags) ? raw.tags.map((t: unknown) => String(t)) : undefined,
    createdAt: formatDisplayDateTimeFromIso(asString(raw.createdAt)),
    updatedAt: raw.updatedAt ?? null,
    deletedAt: raw.deletedAt ?? null,
    likesCount: Number(raw.likesCount ?? 0),
    commentsCount: Number(raw.commentsCount ?? 0),
    likedByCurrentUser: Boolean(raw.likedByCurrentUser),
    community: comm,
  };
}

function mapCommunityPreviewFromApi(raw: ApiRecord): NonNullable<Post["community"]> {
  const cat = asString(raw.category) as CommunityCategory;
  const safeCategory: CommunityCategory =
    cat === "bemestar" || cat === "carreira" || cat === "cultura" || cat === "seguranca" || cat === "outro"
      ? cat
      : "outro";
  return {
    id: asString(raw.id),
    slug: asString(raw.slug),
    name: asString(raw.name),
    avatarUrl: raw.avatarUrl ?? null,
    category: safeCategory,
  };
}

export function mapCommentFromApi(raw: ApiRecord): Comment {
  return {
    id: asString(raw.id),
    postId: asString(raw.postId),
    parentCommentId: raw.parentCommentId != null ? asString(raw.parentCommentId) : null,
    authorId: asString(raw.authorId),
    author: mapUserFromApi(raw.author ?? {}),
    content: asString(raw.content),
    createdAt: formatDisplayDateTimeFromIso(asString(raw.createdAt)),
    deletedAt: raw.deletedAt ?? null,
    hiddenByPostAuthorAt: raw.hiddenByPostAuthorAt ?? null,
    contentModerationMask: raw.contentModerationMask ?? null,
  };
}

export function mapUserProfileFromApi(raw: ApiRecord): UserProfile {
  const socialLinks: SocialLink[] = Array.isArray(raw.socialLinks)
    ? raw.socialLinks.map((s: ApiRecord) => ({
        id: asString(s.id),
        platform: mapSocialPlatform(asString(s.platform)),
        label: asString(s.label),
        url: asString(s.url),
        handle: s.handle ?? undefined,
      }))
    : [];

  const interests = Array.isArray(raw.interests)
    ? raw.interests.map((i: ApiRecord) => ({
        id: asString(i.id),
        label: asString(i.label),
      }))
    : [];

  return {
    id: asString(raw.id),
    name: asString(raw.name),
    username: raw.username ?? undefined,
    avatarUrl: raw.avatarUrl ?? null,
    pronouns: raw.pronouns ?? undefined,
    bannerUrl: raw.bannerUrl ?? null,
    bio: asString(raw.bio ?? ""),
    location: raw.location ?? undefined,
    role: raw.role ?? undefined,
    socialLinks,
    interests,
    suggestions: Array.isArray(raw.suggestions) ? raw.suggestions : [],
    isFollowing: raw.isFollowing ?? undefined,
  };
}
