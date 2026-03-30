import type { Community, CommunityCategory } from "@/domain/types";
import { getCommunityCategoryLabel as getCommunityCategoryLabelFromDomain } from "@/domain/categoryLabels";
import { MOCK_PRIMARY_USER_ID } from "@/domain/mocks/constants";
import { SEED_COMMUNITIES } from "@/domain/mocks/seed";
import { getCommunitiesForUser, getCommunityById } from "@/domain/selectors";

/** @deprecated Prefira `useViewerId()`; mantido para chamadas não-React legadas. */
export const COMMUNITIES_PAGE_VIEWER_ID = MOCK_PRIMARY_USER_ID;

export function getCommunityCategoryLabel(category: CommunityCategory): string {
  return getCommunityCategoryLabelFromDomain(category);
}

function resolveCommunity(seed: Community): Community {
  return getCommunityById(seed.id) ?? seed;
}

/** “Em alta”: ordena por engajamento proxy (membros); estável para futura troca por API. */
export function getTrendingCommunities(): Community[] {
  return [...SEED_COMMUNITIES].map(resolveCommunity).sort((a, b) => b.memberCount - a.memberCount);
}

export function getMyCommunities(userId: string): Community[] {
  return getCommunitiesForUser(userId);
}

/** Comunidades que a usuária ainda não entrou — pode ficar vazio se já participar de todas (mock). */
export function getSuggestedCommunitiesForUser(userId: string): Community[] {
  const joined = new Set(getCommunitiesForUser(userId).map((c) => c.id));
  return SEED_COMMUNITIES.filter((c) => !joined.has(c.id)).map(resolveCommunity);
}

export interface CategoryGroup {
  category: CommunityCategory;
  label: string;
  communities: Community[];
}

export function getCommunitiesGroupedByCategory(): CategoryGroup[] {
  const map = new Map<CommunityCategory, Community[]>();
  for (const c of SEED_COMMUNITIES) {
    const resolved = resolveCommunity(c);
    const list = map.get(resolved.category) ?? [];
    list.push(resolved);
    map.set(resolved.category, list);
  }
  const order: CommunityCategory[] = ["carreira", "bemestar", "cultura", "seguranca", "outro"];
  return order
    .filter((cat) => (map.get(cat)?.length ?? 0) > 0)
    .map((category) => ({
      category,
      label: getCommunityCategoryLabel(category),
      communities: map.get(category)!,
    }));
}
