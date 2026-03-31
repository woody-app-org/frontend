/**
 * Mapa de referência para substituir mocks por HTTP.
 * Ajuste paths e verbos ao contrato real da API Woody.
 *
 * Implementações atuais:
 * - `features/profile/services/profile.service.ts` → updateProfile
 * - `features/communities/services/community.service.ts` → updateCommunity
 * - `features/communities/services/communityMembership.service.ts` → demais ações
 */
export const BACKEND_ROUTE_HINTS = {
  profile: {
    updateProfile: "PUT /users/:userId/profile",
  },
  community: {
    updateCommunity: "PATCH /communities/:communityId",
  },
  membership: {
    joinPublic: "POST /communities/:communityId/members",
    requestJoin: "POST /communities/:communityId/join-requests",
    leave: "DELETE /communities/:communityId/members/me",
    approveJoinRequest: "POST /join-requests/:joinRequestId/approve",
    rejectJoinRequest: "POST /join-requests/:joinRequestId/reject",
    removeMember: "DELETE /communities/:communityId/members/:userId",
    banMember: "PATCH /communities/:communityId/members/:userId { status: 'banned' }",
    setMemberRole: "PATCH /communities/:communityId/members/:userId { role }",
  },
} as const;
