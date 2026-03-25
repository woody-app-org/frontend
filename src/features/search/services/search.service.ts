import type { Post, User } from "@/features/feed/types";

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

export type SearchMode = "topics" | "people";

export interface SearchTopicsResult {
  posts: Post[];
}

export interface SearchPeopleResult {
  people: User[];
}

export interface SearchResultByMode {
  topics: SearchTopicsResult;
  people: SearchPeopleResult;
}

export interface SearchSource {
  posts: Post[];
}

function uniquePeopleFromPosts(posts: Post[]): User[] {
  const map = new Map<string, User>();
  for (const p of posts) {
    if (!p.author?.id) continue;
    map.set(p.author.id, p.author);
  }
  return [...map.values()];
}

export async function searchByMode(params: {
  query: string;
  mode: SearchMode;
  source: SearchSource;
}): Promise<SearchTopicsResult | SearchPeopleResult> {
  const { query, mode, source } = params;

  // Mantém UX consistente com “loading” real, mesmo em mock.
  await delay(250);

  if (!query.trim()) {
    return mode === "topics" ? { posts: [] } : { people: [] };
  }

  if (mode === "topics") {
    const posts = source.posts.filter((p) => {
      return (
        includesQuery(p.title ?? "", query) ||
        includesQuery(p.content ?? "", query) ||
        includesQuery(p.topic ?? "", query) ||
        includesQuery(p.author?.name ?? "", query)
      );
    });
    return { posts };
  }

  const people = uniquePeopleFromPosts(source.posts).filter((u) => {
    return includesQuery(u.name ?? "", query) || includesQuery(u.pronouns ?? "", query);
  });
  return { people };
}

