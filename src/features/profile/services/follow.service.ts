import { api, getApiErrorMessage } from "@/lib/api";

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
