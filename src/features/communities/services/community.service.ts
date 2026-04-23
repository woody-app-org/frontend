import type {
  Community,
  CommunityMemberListItem,
  CommunityMemberRole,
  CommunityPremiumCapabilities,
  JoinRequest,
  Post,
  User,
} from "@/domain/types";
import axios, { isAxiosError } from "axios";
import { api, getApiErrorMessage } from "@/lib/api";
import { createCommunityPremiumCheckout } from "@/features/subscription/services/billingCheckout.service";
import { mapCommunityFromApi, mapPostFromApi, mapUserFromApi } from "@/lib/apiMappers";
import type { CommunityUpdatePayload, CommunityUpdateResult, CreateCommunityPayload } from "../types";

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

export class ProSubscriptionRequiredError extends Error {
  readonly code = "pro_required" as const;
  constructor(message?: string) {
    super(message ?? "Criar comunidades é uma funcionalidade Woody Pro.");
    this.name = "ProSubscriptionRequiredError";
  }
}

export async function fetchAllCommunities(): Promise<Community[]> {
  const { data } = await api.get("/communities");
  return (data as unknown[]).map((c) => mapCommunityFromApi(c as Record<string, unknown>));
}

export async function createCommunity(payload: CreateCommunityPayload): Promise<Community> {
  const validated = validateCommunityUpdatePayload({
    name: payload.name,
    description: payload.description,
    category: payload.category,
    tags: payload.tags,
    rules: payload.rules,
    avatarUrl: payload.avatarUrl ?? null,
    coverUrl: payload.coverUrl ?? null,
    visibility: payload.visibility,
  });
  if (!validated.ok) throw new Error(validated.error);

  try {
    const { data } = await api.post("/communities", {
      name: payload.name.trim(),
      description: payload.description.trim(),
      category: payload.category,
      tags: normalizeTags(payload.tags),
      rules: payload.rules.trim(),
      visibility: payload.visibility,
      avatarUrl: payload.avatarUrl?.trim() || null,
      coverUrl: payload.coverUrl?.trim() || null,
    });
    return mapCommunityFromApi(data as Record<string, unknown>);
  } catch (e) {
    if (isAxiosError(e) && e.response?.status === 403) {
      const body = e.response?.data as { code?: string; error?: string } | undefined;
      if (body?.code === "pro_required") {
        throw new ProSubscriptionRequiredError(typeof body.error === "string" ? body.error : undefined);
      }
    }
    throw new Error(getApiErrorMessage(e, "Não foi possível criar a comunidade."));
  }
}

export async function fetchMyCommunityIdSet(): Promise<Set<string>> {
  try {
    const { data } = await api.get<string[]>("/users/me/communities");
    return new Set(data ?? []);
  } catch {
    return new Set();
  }
}

/** Comunidades em que a utilizadora é membro ativa (para selector do composer). */
export async function fetchMyCommunitiesForComposer(): Promise<Community[]> {
  const idSet = await fetchMyCommunityIdSet();
  if (idSet.size === 0) return [];

  const rows = await Promise.all(
    [...idSet].map(async (id) => {
      try {
        const { data } = await api.get(`/communities/${encodeURIComponent(id)}`);
        return mapCommunityFromApi(data as Record<string, unknown>);
      } catch {
        return null;
      }
    })
  );

  return rows
    .filter((c): c is Community => c != null)
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }));
}

/** API devolveu 403 (ex.: comunidade privada sem membership ativa). O chamador trata sem falhar a página toda. */
export class CommunityPostsForbiddenError extends Error {
  constructor() {
    super("Community posts forbidden");
    this.name = "CommunityPostsForbiddenError";
  }
}

export async function fetchCommunityPosts(
  communityId: string,
  viewerId: string,
  page: number = 1,
  pageSize: number = 100
): Promise<Post[]> {
  try {
    const { data } = await api.get(`/communities/${encodeURIComponent(communityId)}/posts`, {
      params: { page, pageSize },
    });
    const items = data.items ?? [];
    return (items as unknown[]).map((p) => mapPostFromApi(p as Record<string, unknown>, viewerId));
  } catch (e) {
    if (isAxiosError(e) && e.response?.status === 403) {
      throw new CommunityPostsForbiddenError();
    }
    throw e;
  }
}

function mapMemberRole(r: string): CommunityMemberRole {
  if (r === "owner" || r === "admin" || r === "member") return r;
  return "member";
}

function memberRoleOrder(role: CommunityMemberRole): number {
  if (role === "owner") return 0;
  if (role === "admin") return 1;
  return 2;
}

function normalizeMemberList(rows: { user: Record<string, unknown>; role: string }[]): CommunityMemberListItem[] {
  return rows
    .map((row) => ({
      user: mapUserFromApi(row.user),
      role: mapMemberRole(row.role),
    }))
    .sort((a, b) => {
      const roleDiff = memberRoleOrder(a.role) - memberRoleOrder(b.role);
      if (roleDiff !== 0) return roleDiff;
      return a.user.name.localeCompare(b.user.name, "pt-BR", { sensitivity: "base" });
    });
}

export interface FetchCommunityMembersPageResult {
  items: CommunityMemberListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
}

export async function fetchCommunityMembersPage(
  communityId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<FetchCommunityMembersPageResult> {
  const { data } = await api.get(`/communities/${encodeURIComponent(communityId)}/members`, {
    params: { page, pageSize },
  });

  if (Array.isArray(data)) {
    const items = normalizeMemberList(data as { user: Record<string, unknown>; role: string }[]);
    return {
      items,
      page: 1,
      pageSize: items.length || pageSize,
      totalCount: items.length,
      hasNextPage: false,
    };
  }

  const payload = data as {
    items?: { user: Record<string, unknown>; role: string }[];
    page?: number;
    pageSize?: number;
    totalCount?: number;
    hasNextPage?: boolean;
  };
  const items = normalizeMemberList(payload.items ?? []);
  return {
    items,
    page: payload.page ?? page,
    pageSize: payload.pageSize ?? pageSize,
    totalCount: payload.totalCount ?? items.length,
    hasNextPage: payload.hasNextPage ?? false,
  };
}

export async function fetchAllCommunityMembers(communityId: string): Promise<CommunityMemberListItem[]> {
  const all: CommunityMemberListItem[] = [];
  let page = 1;
  let hasNext = true;
  while (hasNext) {
    const chunk = await fetchCommunityMembersPage(communityId, page, 50);
    all.push(...chunk.items);
    hasNext = chunk.hasNextPage;
    page += 1;
  }
  return all;
}

function mapPremiumCapabilities(raw: unknown): CommunityPremiumCapabilities | undefined {
  if (raw == null || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  return {
    isStaffForPremiumTools: Boolean(o.isStaffForPremiumTools),
    communityPremiumActive: Boolean(o.communityPremiumActive),
    canAccessCommunityAnalytics: Boolean(o.canAccessCommunityAnalytics),
    canBoostCommunityPosts: Boolean(o.canBoostCommunityPosts),
  };
}

export async function fetchMyCommunityMembership(communityId: string): Promise<{
  isMember: boolean;
  role: CommunityMemberRole | null;
  premiumCapabilities?: CommunityPremiumCapabilities;
}> {
  try {
    const { data } = await api.get(`/communities/${encodeURIComponent(communityId)}/members/me`);
    const role = mapMemberRole((data?.role as string) ?? "member");
    if (!data?.isMember) return { isMember: false, role: null, premiumCapabilities: undefined };
    return {
      isMember: true,
      role,
      premiumCapabilities: mapPremiumCapabilities((data as { premiumCapabilities?: unknown }).premiumCapabilities),
    };
  } catch {
    return { isMember: false, role: null, premiumCapabilities: undefined };
  }
}

export interface CommunityPremiumAnalyticsPayload {
  communityId: string;
  memberCount: number;
  totalPosts: number;
  headline: string;
  note: string;
}

export async function fetchCommunityPremiumAnalytics(
  communityId: string
): Promise<CommunityPremiumAnalyticsPayload> {
  const { data } = await api.get<CommunityPremiumAnalyticsPayload>(
    `/communities/${encodeURIComponent(communityId)}/premium/analytics`
  );
  return data;
}

export async function boostCommunityPost(communityId: string, postId: string): Promise<void> {
  await api.post(`/communities/${encodeURIComponent(communityId)}/posts/${encodeURIComponent(postId)}/boost`);
}

export async function startCommunityPremiumUpgrade(communityId: string): Promise<void> {
  const { url } = await createCommunityPremiumCheckout(Number(communityId));
  window.location.assign(url);
}

export async function fetchCommunityMembers(communityId: string): Promise<CommunityMemberListItem[]> {
  return fetchAllCommunityMembers(communityId);
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
export function getCommunityResolvedById(id: string): Community | undefined {
  void id;
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
