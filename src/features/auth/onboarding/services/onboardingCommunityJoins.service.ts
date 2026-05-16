import {
  joinCommunityPublic,
  requestJoinCommunity,
} from "@/features/communities/services/communityMembership.service";

/**
 * Após `POST /Auth/register` e token guardado: entra em públicas ou envia pedido em privadas.
 */
export async function persistOnboardingCommunityJoins(communityIds: string[]): Promise<{ failedIds: string[] }> {
  const failedIds: string[] = [];
  for (const id of communityIds) {
    const pub = await joinCommunityPublic("", id);
    if (pub.ok) continue;
    const req = await requestJoinCommunity("", id);
    if (!req.ok) failedIds.push(id);
  }
  return { failedIds };
}
