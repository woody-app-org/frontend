/**
 * Cópia mutável do seed de memberships e join requests.
 * Troca futura: substituir por camada de API / cache (React Query, etc.).
 */
import type { JoinRequest, Membership } from "../types";
import { SEED_JOIN_REQUESTS, SEED_MEMBERSHIPS } from "./seed";

let memberships: Membership[] | null = null;
let joinRequests: JoinRequest[] | null = null;

export function getMembershipRows(): Membership[] {
  if (!memberships) {
    memberships = SEED_MEMBERSHIPS.map((m) => ({ ...m }));
  }
  return memberships;
}

export function getJoinRequestRows(): JoinRequest[] {
  if (!joinRequests) {
    joinRequests = SEED_JOIN_REQUESTS.map((r) => ({ ...r }));
  }
  return joinRequests;
}

/** Apenas para testes ou reset de sessão (opcional). */
export function resetMembershipMockStore(): void {
  memberships = null;
  joinRequests = null;
}
