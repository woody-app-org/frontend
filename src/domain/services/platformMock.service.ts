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
  _userId: string,
  _patch: UpdateProfileInput
): Promise<MockResult<{ user: User }>> {
  await delay(MOCK_DELAY_MS);
  return { ok: true, data: { user: {} as User } };
}

export async function updateCommunityMock(
  _communityId: string,
  _patch: UpdateCommunityInput
): Promise<MockResult<{ community: Community }>> {
  await delay(MOCK_DELAY_MS);
  return { ok: true, data: { community: {} as Community } };
}

export async function requestJoinCommunityMock(
  _userId: string,
  _communityId: string
): Promise<MockResult<{ joinRequestId: string }>> {
  await delay(MOCK_DELAY_MS);
  return { ok: true, data: { joinRequestId: "mock-jr" } };
}

export async function approveMembershipMock(
  _joinRequestId: string,
  _actorUserId: string
): Promise<MockResult<{ membershipId: string }>> {
  await delay(MOCK_DELAY_MS);
  return { ok: true, data: { membershipId: "mock-m" } };
}

export async function rejectMembershipMock(
  _joinRequestId: string,
  _actorUserId: string
): Promise<MockResult<{ joinRequestId: string }>> {
  await delay(MOCK_DELAY_MS);
  return { ok: true, data: { joinRequestId: _joinRequestId } };
}

export async function removeMemberMock(
  _communityId: string,
  _memberUserId: string,
  _actorUserId: string
): Promise<MockResult<{ removedUserId: string }>> {
  await delay(MOCK_DELAY_MS);
  return { ok: true, data: { removedUserId: _memberUserId } };
}

export async function setMemberRoleMock(
  _communityId: string,
  _memberUserId: string,
  _role: CommunityMemberRole,
  _actorUserId: string
): Promise<MockResult<{ membershipId: string }>> {
  await delay(MOCK_DELAY_MS);
  return { ok: true, data: { membershipId: "mock-m" } };
}
