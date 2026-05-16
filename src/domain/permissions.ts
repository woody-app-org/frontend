import type { Community } from "./types";
import {
  getJoinRequestForUserInCommunity,
  getMembershipForUserInCommunity,
} from "./selectors";

/**
 * Visão agregada da relação usuária–comunidade para UI e gates.
 * `none` = sem membership nem pedido relevante no mock atual.
 */
export type CommunityMembershipStatusResult = "none" | "active" | "pending" | "rejected" | "banned";

export function isOwnProfile(viewerId: string | null | undefined, profileUserId: string): boolean {
  return !!viewerId && viewerId === profileUserId;
}

export function canEditProfile(viewerId: string | null | undefined, profileUserId: string): boolean {
  return isOwnProfile(viewerId, profileUserId);
}

export function isCommunityOwner(viewerId: string | null | undefined, community: Community): boolean {
  return !!viewerId && community.ownerUserId === viewerId;
}

/** Dona ou admin ativo podem editar dados da comunidade (próxima etapa: UI). */
export function canEditCommunity(viewerId: string | null | undefined, community: Community): boolean {
  if (!viewerId) return false;
  if (isCommunityOwner(viewerId, community)) return true;
  const m = getMembershipForUserInCommunity(viewerId, community.id);
  return m?.status === "active" && m.role === "admin";
}

/** Incluir aprovar/remover membros e fila de pedidos (owner + admin). */
export function canManageMembers(viewerId: string | null | undefined, community: Community): boolean {
  return canEditCommunity(viewerId, community);
}

export function isCommunityAdmin(viewerId: string | null | undefined, community: Community): boolean {
  if (!viewerId) return false;
  const m = getMembershipForUserInCommunity(viewerId, community.id);
  return m?.status === "active" && m.role === "admin";
}

export function isCommunityMember(viewerId: string | null | undefined, communityId: string): boolean {
  if (!viewerId) return false;
  const m = getMembershipForUserInCommunity(viewerId, communityId);
  return m?.status === "active";
}

export function hasPendingCommunityJoin(
  viewerId: string | null | undefined,
  communityId: string
): boolean {
  return getCommunityMembershipStatus(viewerId, communityId) === "pending";
}

export function getCommunityMembershipStatus(
  viewerId: string | null | undefined,
  communityId: string
): CommunityMembershipStatusResult {
  if (!viewerId) return "none";
  const m = getMembershipForUserInCommunity(viewerId, communityId);
  if (m?.status === "banned") return "banned";
  if (m?.status === "active") return "active";
  if (m?.status === "pending") return "pending";
  if (m?.status === "rejected") return "rejected";
  const jr = getJoinRequestForUserInCommunity(viewerId, communityId);
  if (jr?.status === "pending") return "pending";
  if (jr?.status === "rejected") return "rejected";
  return "none";
}
