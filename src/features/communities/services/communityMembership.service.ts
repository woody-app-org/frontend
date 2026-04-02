/**
 * Membership e pedidos de entrada via API Woody.
 */
import type { CommunityMemberRole } from "@/domain/types";
import { api, getApiErrorMessage } from "@/lib/api";

export type CommunityMembershipActionResult = { ok: true } | { ok: false; error: string };

function ok(): CommunityMembershipActionResult {
  return { ok: true };
}

function fail(e: unknown, fallback: string): CommunityMembershipActionResult {
  return { ok: false, error: getApiErrorMessage(e, fallback) };
}

export async function joinCommunityPublic(
  _userId: string,
  communityId: string
): Promise<CommunityMembershipActionResult> {
  try {
    await api.post(`/communities/${encodeURIComponent(communityId)}/members`);
    return ok();
  } catch (e) {
    return fail(e, "Não foi possível entrar na comunidade.");
  }
}

export async function requestJoinCommunity(
  _userId: string,
  communityId: string
): Promise<CommunityMembershipActionResult> {
  try {
    await api.post(`/communities/${encodeURIComponent(communityId)}/join-requests`);
    return ok();
  } catch (e) {
    return fail(e, "Não foi possível enviar o pedido.");
  }
}

export async function leaveCommunity(
  _userId: string,
  communityId: string
): Promise<CommunityMembershipActionResult> {
  try {
    await api.delete(`/communities/${encodeURIComponent(communityId)}/members/me`);
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

export async function rejectJoinRequest(
  _actorUserId: string,
  joinRequestId: string
): Promise<CommunityMembershipActionResult> {
  try {
    await api.post(`/join-requests/${encodeURIComponent(joinRequestId)}/reject`);
    return ok();
  } catch (e) {
    return fail(e, "Não foi possível rejeitar o pedido.");
  }
}

export async function removeMember(
  _actorUserId: string,
  communityId: string,
  targetUserId: string
): Promise<CommunityMembershipActionResult> {
  try {
    await api.delete(
      `/communities/${encodeURIComponent(communityId)}/members/${encodeURIComponent(targetUserId)}`
    );
    return ok();
  } catch (e) {
    return fail(e, "Não foi possível remover a membro.");
  }
}

export async function banMember(
  _actorUserId: string,
  communityId: string,
  targetUserId: string
): Promise<CommunityMembershipActionResult> {
  try {
    await api.patch(
      `/communities/${encodeURIComponent(communityId)}/members/${encodeURIComponent(targetUserId)}`,
      { status: "banned" }
    );
    return ok();
  } catch (e) {
    return fail(e, "Não foi possível restringir a membro.");
  }
}

export async function setCommunityMemberRole(
  _actorUserId: string,
  communityId: string,
  targetUserId: string,
  role: Exclude<CommunityMemberRole, "owner">
): Promise<CommunityMembershipActionResult> {
  try {
    await api.patch(
      `/communities/${encodeURIComponent(communityId)}/members/${encodeURIComponent(targetUserId)}`,
      { role }
    );
    return ok();
  } catch (e) {
    return fail(e, "Não foi possível alterar o papel.");
  }
}
