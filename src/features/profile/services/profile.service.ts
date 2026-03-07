import type { UserProfile, ProfilePostsResponse } from "../types";
import { MOCK_USER_PROFILE, MOCK_PROFILE_POSTS } from "../mocks/profile.mock";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Busca perfil do usuário por ID.
 * Substituir por chamada à API quando o backend estiver disponível.
 */
export async function getProfile(userId: string): Promise<UserProfile | null> {
  await delay(500);
  if (userId === "1") return MOCK_USER_PROFILE;
  return null;
}

/**
 * Busca posts do perfil com paginação.
 * Substituir por chamada à API quando o backend estiver disponível.
 */
export async function getProfilePosts(
  _userId: string,
  page: number,
  pageSize: number = 10
): Promise<ProfilePostsResponse> {
  await delay(400);
  const totalCount = MOCK_PROFILE_POSTS.length * 2;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = [
    ...MOCK_PROFILE_POSTS,
    ...MOCK_PROFILE_POSTS.map((p, i) => ({ ...p, id: `${p.id}-${i + 10}` })),
  ].slice(start, end);

  return {
    items,
    page,
    pageSize,
    totalCount,
    hasNextPage: end < totalCount,
    hasPreviousPage: page > 1,
  };
}
