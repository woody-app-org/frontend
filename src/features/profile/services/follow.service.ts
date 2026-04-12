/**
 * Cliente HTTP para a rede de seguir (alinhado a `UsersController` no backend).
 *
 * - `GET .../follow/status` — contagens + `isFollowing` do visitante
 * - `POST|DELETE .../follow` — mutação (resposta com `followersCount` do alvo)
 * - `GET .../followers` | `.../following` — listas paginadas (`items`, `totalCount`, …)
 *
 * Para invalidar UI noutros ecrãs após mutação, ver `dispatchSocialGraphChanged` em `@/lib/socialGraphEvents`.
 */
import type { User } from "@/domain/types";
import { api, getApiErrorMessage } from "@/lib/api";
import { mapUserFromApi } from "@/lib/apiMappers";

export interface FollowStatusResponse {
  targetUserId: string;
  /** Null quando anónima ou quando o alvo é o próprio visitante. */
  isFollowing: boolean | null;
  followersCount: number;
  followingCount: number;
}

export interface FollowMutationResponse {
  isFollowing: boolean;
  followersCount: number;
}

function asRecord(data: unknown): Record<string, unknown> {
  return data && typeof data === "object" ? (data as Record<string, unknown>) : {};
}

export interface PaginatedUsersResult {
  items: User[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

function mapPaginatedUsers(data: unknown): PaginatedUsersResult {
  const raw = asRecord(data);
  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  return {
    items: rawItems.map((u) => mapUserFromApi(asRecord(u))),
    page: Number(raw.page ?? 1),
    pageSize: Number(raw.pageSize ?? rawItems.length),
    totalCount: Number(raw.totalCount ?? rawItems.length),
    hasNextPage: Boolean(raw.hasNextPage),
    hasPreviousPage: Boolean(raw.hasPreviousPage),
  };
}

const listPageSizeClamp = (n: number) => Math.min(50, Math.max(1, Math.floor(n)));

/** `GET /users/:userId/followers` */
export async function fetchUserFollowersPage(
  userId: string,
  page: number,
  pageSize: number = 30
): Promise<PaginatedUsersResult> {
  try {
    const { data } = await api.get(`/users/${encodeURIComponent(userId)}/followers`, {
      params: { page, pageSize: listPageSizeClamp(pageSize) },
    });
    return mapPaginatedUsers(data);
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Falha ao carregar seguidores."));
  }
}

/** `GET /users/:userId/following` */
export async function fetchUserFollowingPage(
  userId: string,
  page: number,
  pageSize: number = 30
): Promise<PaginatedUsersResult> {
  try {
    const { data } = await api.get(`/users/${encodeURIComponent(userId)}/following`, {
      params: { page, pageSize: listPageSizeClamp(pageSize) },
    });
    return mapPaginatedUsers(data);
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Falha ao carregar quem segue."));
  }
}

/**
 * `GET /users/:userId/follow/status` — contagens públicas; `isFollowing` só com sessão válida.
 */
export async function fetchFollowStatus(userId: string): Promise<FollowStatusResponse> {
  try {
    const { data } = await api.get(`/users/${encodeURIComponent(userId)}/follow/status`);
    const raw = asRecord(data);
    return {
      targetUserId: String(raw.targetUserId ?? userId),
      isFollowing:
        raw.isFollowing === true ? true : raw.isFollowing === false ? false : null,
      followersCount: Number(raw.followersCount ?? 0),
      followingCount: Number(raw.followingCount ?? 0),
    };
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Falha ao carregar estado de seguir."));
  }
}

/** `POST /users/:userId/follow` */
export async function followUser(userId: string): Promise<FollowMutationResponse> {
  try {
    const { data } = await api.post(`/users/${encodeURIComponent(userId)}/follow`);
    const raw = asRecord(data);
    return {
      isFollowing: Boolean(raw.isFollowing),
      followersCount: Number(raw.followersCount ?? 0),
    };
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível seguir este perfil."));
  }
}

/** `DELETE /users/:userId/follow` */
export async function unfollowUser(userId: string): Promise<FollowMutationResponse> {
  try {
    const { data } = await api.delete(`/users/${encodeURIComponent(userId)}/follow`);
    const raw = asRecord(data);
    return {
      isFollowing: Boolean(raw.isFollowing),
      followersCount: Number(raw.followersCount ?? 0),
    };
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível deixar de seguir."));
  }
}
