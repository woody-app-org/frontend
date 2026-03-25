import type { UserProfile, ProfilePostsResponse } from "../types";
import type { Post } from "@/domain/types";
import { MOCK_USER_PROFILE } from "../mocks/profile.mock";
import { getPostsByAuthorId, getUserById } from "@/domain/selectors";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function profileFromSeedUser(userId: string): UserProfile | null {
  const u = getUserById(userId);
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    username: u.username,
    avatarUrl: u.avatarUrl,
    pronouns: u.pronouns,
    bannerUrl: null,
    bio: u.bio ?? "",
    socialLinks: [],
    interests: [],
    suggestions: [],
  };
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  await delay(350);
  if (MOCK_USER_PROFILE.id === userId) return MOCK_USER_PROFILE;
  return profileFromSeedUser(userId);
}

/**
 * Busca posts da usuária (todas as comunidades em que publicou), com paginação em cima do seed único.
 */
export async function getProfilePosts(
  userId: string,
  page: number,
  pageSize: number = 10
): Promise<ProfilePostsResponse> {
  await delay(400);
  const authorPosts = getPostsByAuthorId(userId);
  const pool: Post[] = [
    ...authorPosts,
    ...authorPosts.map((p, i) => ({ ...p, id: `${p.id}-pprof-${i}` })),
  ];
  const totalCount = pool.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = pool.slice(start, end);

  return {
    items,
    page,
    pageSize,
    totalCount,
    hasNextPage: end < totalCount,
    hasPreviousPage: page > 1,
  };
}
