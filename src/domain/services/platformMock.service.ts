/**
 * Camada de serviço mock para perfil/comunidade/membro.
 * Contratos pensados para troca por chamadas HTTP (mesmos nomes/shapes onde possível).
 */
import type { Community, CommunityMemberRole, User } from "../types";

const MOCK_DELAY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type MockOk<T> = { ok: true; data: T };
export type MockErr = { ok: false; error: string };
export type MockResult<T> = MockOk<T> | MockErr;

export interface UpdateProfileInput {
  name?: string;
  username?: string;
  bio?: string;
  pronouns?: string;
  avatarUrl?: string | null;
}

export interface UpdateCommunityInput {
  name?: string;
  description?: string;
  tags?: string[];
  avatarUrl?: string | null;
  coverUrl?: string | null;
  visibility?: Community["visibility"];
}

export async function updateProfileMock(
  userId: string,
  patch: UpdateProfileInput
): Promise<MockResult<{ user: User }>> {
  void userId;
  void patch;
  await delay(MOCK_DELAY_MS);
  return { ok: true, data: { user: {} as User } };
}

export async function updateCommunityMock(
  communityId: string,
  patch: UpdateCommunityInput
): Promise<MockResult<{ community: Community }>> {
  void communityId;
  void patch;
  await delay(MOCK_DELAY_MS);
  return { ok: true, data: { community: {} as Community } };
}

export async function requestJoinCommunityMock(
  userId: string,
  communityId: string
): Promise<MockResult<{ joinRequestId: string }>> {
  void userId;
  void communityId;
  await delay(MOCK_DELAY_MS);
  return { ok: true, data: { joinRequestId: "mock-jr" } };
}

export async function approveMembershipMock(
  joinRequestId: string,
  actorUserId: string
): Promise<MockResult<{ membershipId: string }>> {
  void joinRequestId;
  void actorUserId;
  await delay(MOCK_DELAY_MS);
  return { ok: true, data: { membershipId: "mock-m" } };
}

export async function rejectMembershipMock(
  joinRequestId: string,
  actorUserId: string
): Promise<MockResult<{ joinRequestId: string }>> {
  void actorUserId;
  await delay(MOCK_DELAY_MS);
  return { ok: true, data: { joinRequestId } };
}

export async function removeMemberMock(
  communityId: string,
  memberUserId: string,
  actorUserId: string
): Promise<MockResult<{ removedUserId: string }>> {
  void communityId;
  void actorUserId;
  await delay(MOCK_DELAY_MS);
  return { ok: true, data: { removedUserId: memberUserId } };
}

export async function setMemberRoleMock(
  communityId: string,
  memberUserId: string,
  role: CommunityMemberRole,
  actorUserId: string
): Promise<MockResult<{ membershipId: string }>> {
  void communityId;
  void memberUserId;
  void role;
  void actorUserId;
  await delay(MOCK_DELAY_MS);
  return { ok: true, data: { membershipId: "mock-m" } };
}
