/**
 * Membership e pedidos de entrada via API Woody.
 */
import type { CommunityMemberRole } from "@/domain/types";
import axios from "axios";
import { api, getApiErrorMessage, getMessageFromApiResponseData } from "@/lib/api";
import { communityApiBaseBySlug } from "./community.service";

export type CommunityMembershipActionResult = { ok: true } | { ok: false; error: string };

/** Resposta de `GET /communities/{id}/join-requests/me`. */
export type MyCommunityJoinRequestMeStatus =
  | "none"
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "member";

export interface MyCommunityJoinRequestMe {
  status: MyCommunityJoinRequestMeStatus;
  requestId: string | null;
  requestedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  canRequest: boolean;
}

export const DEFAULT_MY_COMMUNITY_JOIN_REQUEST: MyCommunityJoinRequestMe = {
  status: "none",
  requestId: null,
  requestedAt: null,
  reviewedAt: null,
  rejectionReason: null,
  canRequest: true,
};

function ok(): CommunityMembershipActionResult {
  return { ok: true };
}

function fail(e: unknown, fallback: string): CommunityMembershipActionResult {
  return { ok: false, error: getApiErrorMessage(e, fallback) };
}

function parseMyCommunityJoinRequestMe(raw: unknown): MyCommunityJoinRequestMe {
  if (raw == null || typeof raw !== "object") return { ...DEFAULT_MY_COMMUNITY_JOIN_REQUEST };
  const o = raw as Record<string, unknown>;
  const statusRaw = typeof o.status === "string" ? o.status.trim().toLowerCase() : "";
  const allowed: MyCommunityJoinRequestMeStatus[] = [
    "none",
    "pending",
    "approved",
    "rejected",
    "cancelled",
    "member",
  ];
  const status = (allowed.includes(statusRaw as MyCommunityJoinRequestMeStatus)
    ? statusRaw
    : "none") as MyCommunityJoinRequestMeStatus;
  return {
    status,
    requestId: typeof o.requestId === "string" ? o.requestId : null,
    requestedAt: typeof o.requestedAt === "string" ? o.requestedAt : null,
    reviewedAt: typeof o.reviewedAt === "string" ? o.reviewedAt : null,
    rejectionReason: typeof o.rejectionReason === "string" ? o.rejectionReason : null,
    canRequest: typeof o.canRequest === "boolean" ? o.canRequest : true,
  };
}

/**
 * Estado do pedido da própria utilizadora nesta comunidade (fonte de verdade pós-reload).
 * Sem sessão ou em erro de rede devolve `null` — tratar como `DEFAULT_MY_COMMUNITY_JOIN_REQUEST`.
 */
export async function fetchMyCommunityJoinRequestStatus(
  communitySlug: string
): Promise<MyCommunityJoinRequestMe | null> {
  try {
    const { data } = await api.get<unknown>(
      `${communityApiBaseBySlug(communitySlug)}/join-requests/me`
    );
    return parseMyCommunityJoinRequestMe(data);
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 401) return null;
    return null;
  }
}

function mapRequestJoinCommunityError(e: unknown): string {
  if (!axios.isAxiosError(e)) return getApiErrorMessage(e, "Não foi possível enviar o pedido.");
  const status = e.response?.status;
  const data = e.response?.data as Record<string, unknown> | undefined;
  const code = typeof data?.code === "string" ? data.code : "";
  const fromBody = getMessageFromApiResponseData(e.response?.data);

  if (code === "membership_banned" || code === "MEMBERSHIP_BANNED") {
    return "Você foi banida desta comunidade e não pode voltar a entrar por este fluxo.";
  }
  if (code === "ACCOUNT_PENDING_VERIFICATION") {
    return "Aguarde a sua verificação para solicitar entrada.";
  }
  if (status === 403) {
    if (fromBody) return fromBody;
    return "Você não tem permissão para solicitar entrada nesta comunidade.";
  }
  if (status === 401) {
    return "Faça login para solicitar entrada.";
  }
  if (status === 400) {
    if (fromBody) return fromBody;
    return "Não foi possível concluir o pedido. Verifique os dados e tente novamente.";
  }
  if (status === 409) {
    return "A tua solicitação já está em análise.";
  }
  return getApiErrorMessage(e, "Não foi possível enviar o pedido.");
}

export async function joinCommunityPublic(
  _userId: string,
  communitySlug: string
): Promise<CommunityMembershipActionResult> {
  try {
    await api.post(`${communityApiBaseBySlug(communitySlug)}/members`);
    return ok();
  } catch (e) {
    if (!axios.isAxiosError(e)) return fail(e, "Não foi possível entrar na comunidade.");
    const data = e.response?.data as Record<string, unknown> | undefined;
    const code = typeof data?.code === "string" ? data.code : "";
    if (code === "membership_banned" || code === "MEMBERSHIP_BANNED") {
      return {
        ok: false,
        error: "Você foi banida desta comunidade e não pode voltar a entrar por este fluxo.",
      };
    }
    return fail(e, "Não foi possível entrar na comunidade.");
  }
}

export async function requestJoinCommunity(
  _userId: string,
  communitySlug: string
): Promise<CommunityMembershipActionResult> {
  try {
    await api.post(`${communityApiBaseBySlug(communitySlug)}/join-requests`);
    return ok();
  } catch (e) {
    return { ok: false, error: mapRequestJoinCommunityError(e) };
  }
}

export async function cancelMyCommunityJoinRequest(
  _userId: string,
  communitySlug: string
): Promise<CommunityMembershipActionResult> {
  try {
    await api.post(`${communityApiBaseBySlug(communitySlug)}/join-requests/me/cancel`);
    return ok();
  } catch (e) {
    return fail(e, "Não foi possível cancelar o pedido.");
  }
}

export async function leaveCommunity(
  _userId: string,
  communitySlug: string
): Promise<CommunityMembershipActionResult> {
  try {
    await api.delete(`${communityApiBaseBySlug(communitySlug)}/members/me`);
    return ok();
  } catch (e) {
    return fail(e, "Não foi possível sair da comunidade.");
  }
}

export async function approveJoinRequest(
  _actorUserId: string,
  joinRequestId: string
): Promise<CommunityMembershipActionResult> {
  try {
    await api.post(`/join-requests/${encodeURIComponent(joinRequestId)}/approve`);
    return ok();
  } catch (e) {
    return fail(e, "Não foi possível aprovar o pedido.");
  }
}

const JOIN_REJECT_REASON_MAX_LEN = 500;

export async function rejectJoinRequest(
  _actorUserId: string,
  joinRequestId: string,
  options?: { reason?: string | null }
): Promise<CommunityMembershipActionResult> {
  try {
    const raw = options?.reason?.trim() ?? "";
    const body =
      raw.length > 0
        ? { reason: raw.slice(0, JOIN_REJECT_REASON_MAX_LEN) }
        : undefined;
    await api.post(`/join-requests/${encodeURIComponent(joinRequestId)}/reject`, body);
    return ok();
  } catch (e) {
    return fail(e, "Não foi possível rejeitar o pedido.");
  }
}

export async function removeMember(
  _actorUserId: string,
  communitySlug: string,
  targetUserId: string
): Promise<CommunityMembershipActionResult> {
  try {
    await api.delete(
      `${communityApiBaseBySlug(communitySlug)}/members/${encodeURIComponent(targetUserId)}`
    );
    return ok();
  } catch (e) {
    return fail(e, "Não foi possível remover a membro.");
  }
}

export async function banMember(
  _actorUserId: string,
  communitySlug: string,
  targetUserId: string
): Promise<CommunityMembershipActionResult> {
  try {
    await api.patch(
      `${communityApiBaseBySlug(communitySlug)}/members/${encodeURIComponent(targetUserId)}`,
      { status: "banned" }
    );
    return ok();
  } catch (e) {
    return fail(e, "Não foi possível restringir a membro.");
  }
}

export async function setCommunityMemberRole(
  _actorUserId: string,
  communitySlug: string,
  targetUserId: string,
  role: Exclude<CommunityMemberRole, "owner">
): Promise<CommunityMembershipActionResult> {
  try {
    await api.patch(
      `${communityApiBaseBySlug(communitySlug)}/members/${encodeURIComponent(targetUserId)}`,
      { role }
    );
    return ok();
  } catch (e) {
    return fail(e, "Não foi possível alterar o papel.");
  }
}
