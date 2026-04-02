import type { Community, CommunityCategory } from "@/domain/types";
import { SEED_COMMUNITIES } from "@/domain/mocks/seed";
import { ONBOARDING_INTERESTS } from "../constants";

const CATEGORY_BY_INTEREST: Partial<Record<string, CommunityCategory[]>> = {
  carreira: ["carreira"],
  tecnologia: ["carreira"],
  estudos: ["carreira"],
  empreendedorismo: ["carreira"],
  financas: ["carreira"],
  maternidade: ["bemestar", "outro"],
  saude: ["bemestar"],
  "bem-estar": ["bemestar"],
  autoestima: ["bemestar"],
  relacionamentos: ["bemestar"],
  hobbies: ["cultura"],
  leitura: ["cultura"],
};

function interestKeywords(interestIds: string[]): string[] {
  const set = new Set<string>();
  for (const id of interestIds) {
    const def = ONBOARDING_INTERESTS.find((i) => i.id === id);
    if (def) {
      for (const k of def.matchKeywords) {
        set.add(k.toLowerCase());
      }
    }
  }
  return [...set];
}

/** Pontua comunidades com base nos interesses (mock local; futuro: endpoint de recomendação). */
export function scoreCommunityForOnboarding(
  community: Community,
  interestIds: string[]
): number {
  if (interestIds.length === 0) return community.memberCount;

  let score = 0;
  const keywords = interestKeywords(interestIds);
  const tagLower = community.tags.map((t) => t.toLowerCase());
  const desc = community.description.toLowerCase();
  const name = community.name.toLowerCase();

  for (const id of interestIds) {
    const cats = CATEGORY_BY_INTEREST[id];
    if (cats?.includes(community.category)) score += 5;
  }

  for (const kw of keywords) {
    if (tagLower.some((t) => t.includes(kw) || kw.includes(t))) score += 4;
    if (name.includes(kw)) score += 2;
    if (desc.includes(kw)) score += 1;
  }

  score += Math.min(community.memberCount / 400, 2.5);
  return score;
}

export function getRecommendedCommunitiesForOnboarding(
  interestIds: string[],
  limit = 8
): Community[] {
  const ranked = [...SEED_COMMUNITIES].map((c) => ({
    c,
    s: scoreCommunityForOnboarding(c, interestIds),
  }));
  ranked.sort((a, b) => b.s - a.s || b.c.memberCount - a.c.memberCount);
  return ranked.slice(0, limit).map((x) => x.c);
}
