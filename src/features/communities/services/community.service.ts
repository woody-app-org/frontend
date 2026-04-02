import type {
  Community,
  CommunityMemberListItem,
  CommunityMemberRole,
  JoinRequest,
  Post,
  User,
} from "@/domain/types";
import axios from "axios";
import { api, getApiErrorMessage } from "@/lib/api";
import { mapCommunityFromApi, mapPostFromApi, mapUserFromApi } from "@/lib/apiMappers";
import type { CommunityUpdatePayload, CommunityUpdateResult } from "../types";

function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tags) {
    const s = t.trim();
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

export function validateCommunityUpdatePayload(
  payload: CommunityUpdatePayload
): { ok: true } | { ok: false; error: string } {
  const name = payload.name.trim();
  if (name.length < 2) return { ok: false, error: "Informe um nome com pelo menos 2 caracteres." };
  if (name.length > 80) return { ok: false, error: "Nome da comunidade muito longo." };

  const description = payload.description.trim();
  if (description.length < 10) return { ok: false, error: "A descrição precisa de pelo menos 10 caracteres." };
  if (description.length > 2_000) return { ok: false, error: "Descrição muito longa (máx. 2000 caracteres)." };

  const tagsNorm = normalizeTags(payload.tags);
  if (tagsNorm.length > 12) return { ok: false, error: "Muitas tags (máx. 12)." };
  for (const t of tagsNorm) {
    if (t.length > 40) return { ok: false, error: "Uma das tags é muito longa." };
  }

  if (payload.rules.trim().length > 4_000) {
    return { ok: false, error: "Regras muito longas (máx. 4000 caracteres)." };
  }

  return { ok: true };
}

export async function fetchCommunityBySlug(slug: string): Promise<Community | null> {
  try {
    const { data } = await api.get(`/communities/by-slug/${encodeURIComponent(slug)}`);
    return mapCommunityFromApi(data);
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) return null;
    throw new Error(getApiErrorMessage(e, "Falha ao carregar comunidade."));
  }
}

export async function fetchAllCommunities(): Promise<Community[]> {
  const { data } = await api.get("/communities");
  return (data as unknown[]).map((c) => mapCommunityFromApi(c as Record<string, unknown>));
}

export async function fetchMyCommunityIdSet(): Promise<Set<string>> {
  try {
    const { data } = await api.get<string[]>("/users/me/communities");
    return new Set(data ?? []);
  } catch {
    return new Set();
  }
}

export async function fetchCommunityPosts(
  communityId: string,
  viewerId: string,
  page: number = 1,
  pageSize: number = 100
): Promise<Post[]> {
  const { data } = await api.get(`/communities/${encodeURIComponent(communityId)}/posts`, {
    params: { page, pageSize },
  });
  const items = data.items ?? [];
  return (items as unknown[]).map((p) => mapPostFromApi(p as Record<string, unknown>, viewerId));
}

function mapMemberRole(r: string): CommunityMemberRole {
  if (r === "owner" || r === "admin" || r === "member") return r;
  return "member";
}

export async function fetchCommunityMembers(communityId: string): Promise<CommunityMemberListItem[]> {
  const { data } = await api.get(`/communities/${encodeURIComponent(communityId)}/members`);
  const rows = data as { user: Record<string, unknown>; role: string }[];
  return rows.map((row) => ({
    user: mapUserFromApi(row.user),
    role: mapMemberRole(row.role),
  }));
}

export interface JoinRequestWithUser {
  request: JoinRequest;
  user: User;
}

export async function fetchCommunityJoinRequestRows(communityId: string): Promise<JoinRequestWithUser[]> {
  try {
    const { data } = await api.get<
      {
        id: string;
        communityId: string;
        userId: string;
        status: string;
        requestedAt?: string;
        user: Record<string, unknown>;
      }[]
    >(`/communities/${encodeURIComponent(communityId)}/join-requests`);
    return (data ?? []).map((r) => ({
      request: {
        id: r.id,
        communityId: r.communityId,
        userId: r.userId,
        status: r.status as JoinRequest["status"],
        requestedAt: r.requestedAt,
      },
      user: mapUserFromApi(r.user),
    }));
  } catch {
    return [];
  }
}

export async function fetchCommunityById(id: string): Promise<Community | null> {
  try {
    const { data } = await api.get(`/communities/${encodeURIComponent(id)}`);
    return mapCommunityFromApi(data);
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) return null;
    throw new Error(getApiErrorMessage(e, "Falha ao carregar comunidade."));
  }
}

/** @deprecated Prefer `fetchCommunityBySlug` (API). Mantido para compatibilidade de imports. */
export function getCommunityResolvedBySlug(slug: string): Community | undefined {
  void slug;
  return undefined;
}

/** @deprecated Prefer `fetchCommunityById` (API). */
export function getCommunityResolvedById(_id: string): Community | undefined {
  return undefined;
}

export async function updateCommunity(
  _actorUserId: string,
  communityId: string,
  payload: CommunityUpdatePayload
): Promise<CommunityUpdateResult> {
  const validated = validateCommunityUpdatePayload(payload);
  if (!validated.ok) return validated;

  try {
    const { data } = await api.patch(`/communities/${encodeURIComponent(communityId)}`, {
      name: payload.name.trim(),
      description: payload.description.trim(),
      category: payload.category,
      tags: normalizeTags(payload.tags),
      rules: payload.rules.trim(),
      avatarUrl: payload.avatarUrl,
      coverUrl: payload.coverUrl,
      visibility: payload.visibility,
    });
    return { ok: true, community: mapCommunityFromApi(data) };
  } catch (e) {
    return { ok: false, error: getApiErrorMessage(e, "Não foi possível atualizar a comunidade.") };
  }
}
