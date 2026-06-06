import type {
  Community,
  CommunityCategory,
  CommunityMemberListItem,
  CommunityMemberRole,
  CommunityPremiumCapabilities,
  CommunityVisibility,
  JoinRequest,
  Post,
  User,
} from "@/domain/types";
import axios, { isAxiosError } from "axios";
import { api, getApiErrorMessage } from "@/lib/api";
import { createCommunityPremiumCheckout } from "@/features/subscription/services/billingCheckout.service";
import { mapCommunityFromApi, mapPostFromApi, mapUserFromApi } from "@/lib/apiMappers";
import type { CommunityUpdatePayload, CommunityUpdateResult, CreateCommunityPayload } from "../types";

/** Base path preferido para operações scoped à comunidade (API pública por slug). */
export function communityApiBaseBySlug(slug: string): string {
  return `/communities/by-slug/${encodeURIComponent(slug)}`;
}

export interface MyCommunitySummary {
  id: string;
  slug: string;
  name: string;
  role: string;
  visibility: CommunityVisibility;
  avatarUrl: string | null;
  coverUrl: string | null;
}

function mapMyCommunitySummary(raw: Record<string, unknown>): MyCommunitySummary {
  const visibilityRaw = typeof raw.visibility === "string" ? raw.visibility.trim().toLowerCase() : "public";
  const visibility: CommunityVisibility = visibilityRaw === "private" ? "private" : "public";
  return {
    id: String(raw.id ?? ""),
    slug: String(raw.slug ?? ""),
    name: String(raw.name ?? ""),
    role: String(raw.role ?? "member"),
    visibility,
    avatarUrl: typeof raw.avatarUrl === "string" ? raw.avatarUrl : null,
    coverUrl: typeof raw.coverUrl === "string" ? raw.coverUrl : null,
  };
}

function mySummaryToComposerCommunity(row: MyCommunitySummary): Community {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: "",
    category: "outro" as CommunityCategory,
    tags: [],
    rules: "",
    avatarUrl: row.avatarUrl,
    coverUrl: row.coverUrl,
    ownerUserId: "",
    visibility: row.visibility,
    memberCount: 0,
  };
}

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

export class CommunityLimitReachedError extends Error {
  readonly code = "community_limit_reached" as const;
  constructor(message?: string) {
    super(message ?? "O plano Pro permite criar apenas 1 comunidade.");
    this.name = "CommunityLimitReachedError";
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
      if (body?.code === "community_limit_reached") {
        throw new CommunityLimitReachedError(typeof body.error === "string" ? body.error : undefined);
      }
    }
    throw new Error(getApiErrorMessage(e, "Não foi possível criar a comunidade."));
  }
}

export async function fetchMyCommunities(): Promise<MyCommunitySummary[]> {
  try {
    const { data } = await api.get<unknown[]>("/users/me/communities");
    return (data ?? []).map((row) => mapMyCommunitySummary(row as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function fetchMyCommunityIdSet(): Promise<Set<string>> {
  const rows = await fetchMyCommunities();
  return new Set(rows.map((r) => r.id));
}

/** Comunidades em que a utilizadora é membro ativa (para selector do composer). */
export async function fetchMyCommunitiesForComposer(): Promise<Community[]> {
  const rows = await fetchMyCommunities();
  return rows
    .map(mySummaryToComposerCommunity)
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }));
}

/** API devolveu 403 (ex.: comunidade privada sem membership ativa). O chamador trata sem falhar a página toda. */
export class CommunityPostsForbiddenError extends Error {
  constructor() {
    super("Community posts forbidden");
    this.name = "CommunityPostsForbiddenError";
  }
}

/** `GET /communities/:id/join-requests` devolveu 403 (sem permissão de moderação). */
export class CommunityJoinRequestsForbiddenError extends Error {
  constructor() {
    super("Community join requests forbidden");
    this.name = "CommunityJoinRequestsForbiddenError";
  }
}

export async function fetchCommunityPosts(
  communitySlug: string,
  viewerId: string,
  page: number = 1,
  pageSize: number = 100
): Promise<Post[]> {
  try {
    const { data } = await api.get(`${communityApiBaseBySlug(communitySlug)}/posts`, {
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
  communitySlug: string,
  page: number = 1,
  pageSize: number = 20
): Promise<FetchCommunityMembersPageResult> {
  const { data } = await api.get(`${communityApiBaseBySlug(communitySlug)}/members`, {
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

export async function fetchAllCommunityMembers(communitySlug: string): Promise<CommunityMemberListItem[]> {
  const all: CommunityMemberListItem[] = [];
  let page = 1;
  let hasNext = true;
  while (hasNext) {
    const chunk = await fetchCommunityMembersPage(communitySlug, page, 50);
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
    canAccessCommunityMaxFeatures: Boolean(o.canAccessCommunityMaxFeatures),
  };
}

export async function fetchMyCommunityMembership(communitySlug: string): Promise<{
  isMember: boolean;
  role: CommunityMemberRole | null;
  premiumCapabilities?: CommunityPremiumCapabilities;
}> {
  try {
    const { data } = await api.get(`${communityApiBaseBySlug(communitySlug)}/members/me`);
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

export interface CommunityAnalyticsPeriodBucket {
  newMembersJoined: number;
  memberLeavesRecorded: number;
  pageViews: number;
  postsPublished: number;
  commentsPosted: number;
  likesOnPosts: number;
}

export interface CommunityPremiumDashboardPayload {
  communityId: string;
  slug?: string | null;
  periodDays: number;
  periodStartUtc: string;
  periodEndUtc: string;
  previousPeriodStartUtc: string;
  previousPeriodEndUtc: string;
  memberCount: number;
  totalPosts: number;
  headline?: string;
  note?: string | null;
  current: CommunityAnalyticsPeriodBucket;
  previous: CommunityAnalyticsPeriodBucket;
  engagement: { averageInteractionsPerPost: number; definition: string };
  topPosts: Array<{
    postId: string;
    contentPreview: string;
    createdAtUtc: string;
    likesCount: number;
    commentsCount: number;
    score: number;
    authorUsername: string;
  }>;
  topTags: Array<{ tag: string; count: number }>;
  dailyActivity: Array<{
    dayUtc: string;
    posts: number;
    comments: number;
    pageViews: number;
    memberLeaves: number;
    newMembers: number;
  }>;
}

/** @deprecated Usar `CommunityPremiumDashboardPayload`. */
export type CommunityPremiumAnalyticsPayload = CommunityPremiumDashboardPayload;

export async function fetchCommunityPremiumAnalytics(
  communitySlug: string,
  days: number = 30
): Promise<CommunityPremiumDashboardPayload> {
  const { data } = await api.get<CommunityPremiumDashboardPayload>(
    `${communityApiBaseBySlug(communitySlug)}/premium/analytics`,
    { params: { days } }
  );
  return data;
}

export interface CommunityPostBoostResponse {
  id: string;
  postId: string;
  communityId: string;
  startedAtUtc: string;
  endsAtUtc: string;
  active: boolean;
}

export interface CommunityPostBoostListItem {
  id: string;
  postId: string;
  postContentPreview: string | null;
  startedAtUtc: string;
  endsAtUtc: string;
  active: boolean;
}

export async function boostCommunityPost(
  communitySlug: string,
  postId: string,
  durationDays?: number
): Promise<CommunityPostBoostResponse> {
  const { data, status } = await api.post<CommunityPostBoostResponse>(
    `${communityApiBaseBySlug(communitySlug)}/posts/${encodeURIComponent(postId)}/boost`,
    durationDays != null ? { durationDays } : {}
  );
  if (status !== 201 && status !== 200) {
    throw new Error("Resposta inesperada do servidor.");
  }
  return data;
}

export async function unboostCommunityPost(communitySlug: string, postId: string): Promise<void> {
  await api.delete(
    `${communityApiBaseBySlug(communitySlug)}/posts/${encodeURIComponent(postId)}/boost`
  );
}

export async function fetchCommunityPostBoosts(communitySlug: string): Promise<CommunityPostBoostListItem[]> {
  const { data } = await api.get<CommunityPostBoostListItem[]>(
    `${communityApiBaseBySlug(communitySlug)}/post-boosts`
  );
  return Array.isArray(data) ? data : [];
}

/** Stripe checkout ainda exige id numérico interno. */
export async function startCommunityPremiumUpgrade(communityId: string): Promise<void> {
  const { url } = await createCommunityPremiumCheckout(Number(communityId));
  window.location.assign(url);
}

export async function fetchCommunityMembers(communitySlug: string): Promise<CommunityMemberListItem[]> {
  return fetchAllCommunityMembers(communitySlug);
}

export interface JoinRequestWithUser {
  request: JoinRequest;
  user: User;
}

export async function fetchCommunityJoinRequestRows(communitySlug: string): Promise<JoinRequestWithUser[]> {
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
    >(`${communityApiBaseBySlug(communitySlug)}/join-requests`);
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
  } catch (e) {
    if (isAxiosError(e) && e.response?.status === 403) {
      throw new CommunityJoinRequestsForbiddenError();
    }
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
  communitySlug: string,
  payload: CommunityUpdatePayload
): Promise<CommunityUpdateResult> {
  const validated = validateCommunityUpdatePayload(payload);
  if (!validated.ok) return validated;

  try {
    const { data } = await api.patch(`${communityApiBaseBySlug(communitySlug)}`, {
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
