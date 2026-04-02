import type { Community, Post, User } from "@/domain/types";
import { getCommunityCategoryLabel } from "@/domain/categoryLabels";
import { getAllSeedPostsEnriched, getCommunityById, getUserById } from "@/domain/selectors";
import { SEED_COMMUNITIES, SEED_USERS } from "@/domain/mocks/seed";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

function includesQuery(haystack: string, query: string): boolean {
  if (!query) return true;
  return normalize(haystack).includes(normalize(query));
}

export type SearchMode = "posts" | "people" | "communities";

export interface SearchPostsResult {
  posts: Post[];
}

export interface SearchPeopleResult {
  people: User[];
}

export interface SearchCommunitiesResult {
  communities: Community[];
}

export async function searchByMode(params: {
  query: string;
  mode: SearchMode;
  /** Para `likedByCurrentUser` e futuros filtros ligados à sessão. */
  viewerId: string;
}): Promise<SearchPostsResult | SearchPeopleResult | SearchCommunitiesResult> {
  const { query, mode, viewerId } = params;
  await delay(260);

  const q = query.trim();
  if (!q) {
    if (mode === "posts") return { posts: [] };
    if (mode === "people") return { people: [] };
    return { communities: [] };
  }

  if (mode === "posts") {
    const posts = getAllSeedPostsEnriched(viewerId).filter((p) => {
      const tagMatch = p.tags?.some((t) => includesQuery(t, q)) ?? false;
      const categoryMatch =
        p.community != null && includesQuery(getCommunityCategoryLabel(p.community.category), q);
      return (
        includesQuery(p.title ?? "", q) ||
        includesQuery(p.content ?? "", q) ||
        includesQuery(p.community?.name ?? "", q) ||
        includesQuery(p.author?.name ?? "", q) ||
        includesQuery(p.author?.username ?? "", q) ||
        tagMatch ||
        categoryMatch
      );
    });
    return { posts };
  }

  if (mode === "people") {
    const people = SEED_USERS.filter((u) => {
      return (
        includesQuery(u.name ?? "", q) ||
        includesQuery(u.username ?? "", q) ||
        includesQuery(u.bio ?? "", q) ||
        includesQuery(u.pronouns ?? "", q)
      );
    })
      .map((u) => getUserById(u.id))
      .filter((u): u is User => u != null);
    return { people };
  }

  const communities = SEED_COMMUNITIES.filter((c) => {
    const tagMatch = c.tags.some((t) => includesQuery(t, q));
    const cat = getCommunityCategoryLabel(c.category);
    return (
      includesQuery(c.name, q) ||
      includesQuery(c.slug, q) ||
      includesQuery(c.description, q) ||
      includesQuery(cat, q) ||
      tagMatch
    );
  })
    .map((c) => getCommunityById(c.id))
    .filter((c): c is Community => c != null);
  return { communities };
}
