import type { Community, CommunityMemberRole, User } from "@/domain/types";
import { api, getApiErrorMessage } from "@/lib/api";
import { mapCommunityFromApi, mapUserFromApi } from "@/lib/apiMappers";

export interface UserCommunityMembershipRow {
  community: Community;
  role: CommunityMemberRole;
}

function mapMembershipRole(r: string): CommunityMemberRole {
  if (r === "owner" || r === "admin" || r === "member") return r;
  return "member";
}

export async function fetchUserCommunityMemberships(userId: string): Promise<UserCommunityMembershipRow[]> {
  try {
    const { data } = await api.get(`/users/${encodeURIComponent(userId)}/communities`);
    const rows = data as { community: Record<string, unknown>; role: string }[];
    return (rows ?? []).map((r) => ({
      community: mapCommunityFromApi(r.community),
      role: mapMembershipRole(r.role),
    }));
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Falha ao carregar comunidades do perfil."));
  }
}

export async function fetchMyFollowing(page = 1, pageSize = 50): Promise<User[]> {
  const { data } = await api.get("/users/me/following", {
    params: { page, pageSize: Math.min(Math.max(pageSize, 1), 50) },
  });
  const raw = data as Record<string, unknown> | unknown[];
  const list = Array.isArray(raw) ? raw : ((raw?.items as unknown[]) ?? []);
  return list.map((u) => mapUserFromApi(u as Record<string, unknown>));
}

export async function fetchMySuggestions(take = 8): Promise<User[]> {
  const { data } = await api.get("/users/me/suggestions", { params: { take } });
  const list = data as unknown[];
  return (list ?? []).map((u) => mapUserFromApi(u as Record<string, unknown>));
}
