/**
 * Ações mockadas de membership e pedidos de entrada.
 * Substituir por chamadas HTTP mantendo estes nomes facilita o mapeamento com o backend.
 */
import { canManageMembers, isCommunityOwner } from "@/domain/permissions";
import { getJoinRequestRows, getMembershipRows } from "@/domain/mocks/membershipMockStore";
import type { CommunityMemberRole } from "@/domain/types";
import { getCommunityResolvedById } from "./community.service";

export type CommunityMembershipActionResult = { ok: true } | { ok: false; error: string };

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let membershipSeq = 0;
function newMembershipId(): string {
  membershipSeq += 1;
  return `m-live-${membershipSeq}`;
}

let jrSeq = 0;
function newJoinRequestId(): string {
  jrSeq += 1;
  return `jr-live-${jrSeq}`;
}

export async function joinCommunityPublic(
  userId: string,
  communityId: string
): Promise<CommunityMembershipActionResult> {
  await delay(380);
  const comm = getCommunityResolvedById(communityId);
  if (!comm) return { ok: false, error: "Comunidade não encontrada." };
  if (comm.visibility !== "public") {
    return { ok: false, error: "Esta comunidade exige aprovação." };
  }

  const rows = getMembershipRows();
  const existing = rows.find((m) => m.userId === userId && m.communityId === communityId);
  if (existing?.status === "banned") {
    return { ok: false, error: "Sua conta está restrita neste espaço." };
  }
  if (existing?.status === "active") {
    return { ok: false, error: "Você já participa desta comunidade." };
  }
  if (existing) {
    existing.status = "active";
    if (existing.role !== "owner") existing.role = "member";
    existing.joinedAt = new Date().toISOString().slice(0, 10);
    return { ok: true };
  }

  rows.push({
    id: newMembershipId(),
    userId,
    communityId,
    role: "member",
    status: "active",
    joinedAt: new Date().toISOString().slice(0, 10),
  });
  return { ok: true };
}

export async function requestJoinCommunity(
  userId: string,
  communityId: string
): Promise<CommunityMembershipActionResult> {
  await delay(400);
  const comm = getCommunityResolvedById(communityId);
  if (!comm) return { ok: false, error: "Comunidade não encontrada." };
  if (comm.visibility !== "private") {
    return { ok: false, error: "Esta comunidade é pública — participe diretamente." };
  }

  const mRows = getMembershipRows();
  const m = mRows.find((x) => x.userId === userId && x.communityId === communityId);
  if (m?.status === "active") return { ok: false, error: "Você já participa." };
  if (m?.status === "pending") {
    return { ok: false, error: "Sua entrada já está aguardando aprovação." };
  }
  if (m?.status === "banned") {
    return { ok: false, error: "Sua conta está restrita neste espaço." };
  }

  const jRows = getJoinRequestRows();
  const jr = jRows.find((r) => r.userId === userId && r.communityId === communityId);
  if (jr) {
    if (jr.status === "pending") return { ok: false, error: "Solicitação já enviada." };
    jr.status = "pending";
    jr.requestedAt = new Date().toISOString();
    return { ok: true };
  }

  jRows.push({
    id: newJoinRequestId(),
    communityId,
    userId,
    status: "pending",
    requestedAt: new Date().toISOString(),
  });
  return { ok: true };
}

export async function leaveCommunity(
  userId: string,
  communityId: string
): Promise<CommunityMembershipActionResult> {
  await delay(350);
  const comm = getCommunityResolvedById(communityId);
  if (!comm) return { ok: false, error: "Comunidade não encontrada." };
  if (comm.ownerUserId === userId) {
    return {
      ok: false,
      error: "A dona não pode sair por aqui no mock — em produção haveria transferência de posse.",
    };
  }

  const rows = getMembershipRows();
  const idx = rows.findIndex(
    (x) => x.userId === userId && x.communityId === communityId && x.status === "active"
  );
  if (idx === -1) return { ok: false, error: "Você não é membro ativa desta comunidade." };
  rows.splice(idx, 1);
  return { ok: true };
}

export async function approveJoinRequest(
  actorUserId: string,
  joinRequestId: string
): Promise<CommunityMembershipActionResult> {
  await delay(450);
  const jRows = getJoinRequestRows();
  const jr = jRows.find((r) => r.id === joinRequestId);
  if (!jr || jr.status !== "pending") {
    return { ok: false, error: "Solicitação não encontrada ou já processada." };
  }
  const comm = getCommunityResolvedById(jr.communityId);
  if (!comm || !canManageMembers(actorUserId, comm)) {
    return { ok: false, error: "Sem permissão para aprovar." };
  }

  jr.status = "approved";
  const mRows = getMembershipRows();
  let mem = mRows.find((x) => x.userId === jr.userId && x.communityId === jr.communityId);
  if (mem) {
    mem.status = "active";
    if (mem.role !== "owner") mem.role = "member";
    mem.joinedAt = mem.joinedAt ?? new Date().toISOString().slice(0, 10);
  } else {
    mRows.push({
      id: newMembershipId(),
      userId: jr.userId,
      communityId: jr.communityId,
      role: "member",
      status: "active",
      joinedAt: new Date().toISOString().slice(0, 10),
    });
  }
  return { ok: true };
}

export async function rejectJoinRequest(
  actorUserId: string,
  joinRequestId: string
): Promise<CommunityMembershipActionResult> {
  await delay(400);
  const jRows = getJoinRequestRows();
  const jr = jRows.find((r) => r.id === joinRequestId);
  if (!jr || jr.status !== "pending") {
    return { ok: false, error: "Solicitação não encontrada." };
  }
  const comm = getCommunityResolvedById(jr.communityId);
  if (!comm || !canManageMembers(actorUserId, comm)) {
    return { ok: false, error: "Sem permissão." };
  }
  jr.status = "rejected";
  return { ok: true };
}

export async function removeMember(
  actorUserId: string,
  communityId: string,
  targetUserId: string
): Promise<CommunityMembershipActionResult> {
  await delay(420);
  const comm = getCommunityResolvedById(communityId);
  if (!comm || !canManageMembers(actorUserId, comm)) {
    return { ok: false, error: "Sem permissão." };
  }
  if (comm.ownerUserId === targetUserId) {
    return { ok: false, error: "Não é possível remover a dona." };
  }
  const rows = getMembershipRows();
  const idx = rows.findIndex(
    (x) => x.userId === targetUserId && x.communityId === communityId && x.status === "active"
  );
  if (idx === -1) return { ok: false, error: "Membro ativa não encontrada." };
  rows.splice(idx, 1);
  return { ok: true };
}

export async function banMember(
  actorUserId: string,
  communityId: string,
  targetUserId: string
): Promise<CommunityMembershipActionResult> {
  await delay(400);
  const comm = getCommunityResolvedById(communityId);
  if (!comm || !canManageMembers(actorUserId, comm)) {
    return { ok: false, error: "Sem permissão." };
  }
  if (comm.ownerUserId === targetUserId) {
    return { ok: false, error: "Não é possível restringir a dona." };
  }
  const rows = getMembershipRows();
  const mem = rows.find((x) => x.userId === targetUserId && x.communityId === communityId);
  if (!mem) return { ok: false, error: "Usuária não encontrada nesta comunidade." };
  mem.status = "banned";
  return { ok: true };
}

export async function setCommunityMemberRole(
  actorUserId: string,
  communityId: string,
  targetUserId: string,
  role: Exclude<CommunityMemberRole, "owner">
): Promise<CommunityMembershipActionResult> {
  await delay(400);
  const comm = getCommunityResolvedById(communityId);
  if (!comm) return { ok: false, error: "Comunidade não encontrada." };
  if (!isCommunityOwner(actorUserId, comm)) {
    return { ok: false, error: "Apenas a dona altera administradoras." };
  }
  if (comm.ownerUserId === targetUserId) {
    return { ok: false, error: "A dona já tem o papel máximo." };
  }
  const rows = getMembershipRows();
  const mem = rows.find(
    (x) => x.userId === targetUserId && x.communityId === communityId && x.status === "active"
  );
  if (!mem) return { ok: false, error: "Membro ativa não encontrada." };
  mem.role = role;
  return { ok: true };
}
