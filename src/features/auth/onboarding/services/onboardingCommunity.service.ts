import type { Community } from "@/domain/types";
import { fetchAllCommunities } from "@/features/communities/services/community.service";
import { rankCommunitiesForOnboarding } from "../lib/recommendCommunities";

/**
 * Lista comunidades reais da API e aplica a mesma pontuação por interesses do onboarding.
 */
export async function fetchOnboardingCommunitySuggestions(
  interestIds: string[],
  limit = 8
): Promise<Community[]> {
  const all = await fetchAllCommunities();
  return rankCommunitiesForOnboarding(all, interestIds, limit);
}
