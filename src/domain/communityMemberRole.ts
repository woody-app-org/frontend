import type { Community, CommunityMemberRole, Membership } from "./types";

/** Hierarquia para ordenação e destaque (menor = mais acima na lista). */
const ROLE_RANK: Record<CommunityMemberRole, number> = {
  owner: 0,
  admin: 1,
  member: 2,
};

/**
 * Papel efetivo para UI, alinhando `ownerUserId` da comunidade com `membership.role`.
 * Preparado para DTOs futuros onde dona e campo `owner` possam divergir temporariamente.
 */
export function resolveEffectiveCommunityRole(m: Membership, community: Community): CommunityMemberRole {
  if (community.ownerUserId === m.userId || m.role === "owner") return "owner";
  if (m.role === "admin") return "admin";
  return "member";
}

export function communityMemberRoleRank(role: CommunityMemberRole): number {
  return ROLE_RANK[role];
}

/** Compara duas memberships ativas para listagens (owner → admin → membro; empate por id estável). */
export function compareActiveMembershipsByHierarchy(
  a: Membership,
  b: Membership,
  community: Community
): number {
  const ra = communityMemberRoleRank(resolveEffectiveCommunityRole(a, community));
  const rb = communityMemberRoleRank(resolveEffectiveCommunityRole(b, community));
  if (ra !== rb) return ra - rb;
  return a.userId.localeCompare(b.userId);
}

export function sortActiveMembershipsByHierarchy(
  rows: Membership[],
  community: Community
): Membership[] {
  return [...rows].sort((x, y) => compareActiveMembershipsByHierarchy(x, y, community));
}

/** Rótulos curtos em contextos públicos (perfil, “quem participa”). */
export function getCommunityMemberRolePublicLabel(role: CommunityMemberRole): string {
  switch (role) {
    case "owner":
      return "Criadora";
    case "admin":
      return "Admin";
    case "member":
      return "Membro";
  }
}

/** Rótulos na moderação (mantém “Dona” como linguagem já usada no painel). */
export function getCommunityMemberRoleManagementLabel(
  role: CommunityMemberRole,
  isOwnerUser: boolean
): string {
  if (isOwnerUser || role === "owner") return "Dona";
  if (role === "admin") return "Admin";
  return "Membro";
}

export function getCommunityMemberRoleManagementBadgeClass(
  role: CommunityMemberRole,
  isOwnerUser: boolean
): string {
  if (isOwnerUser || role === "owner") {
    return "bg-[var(--woody-nav)]/18 text-[var(--woody-text)] ring-1 ring-[var(--woody-nav)]/25";
  }
  if (role === "admin") {
    return "bg-amber-500/12 text-amber-900 dark:text-amber-100 ring-1 ring-amber-500/20";
  }
  return "bg-[var(--woody-accent)]/10 text-[var(--woody-text)] ring-1 ring-[var(--woody-accent)]/15";
}
