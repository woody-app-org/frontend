import type { Community, Post, User } from "@/domain/types";
import { api, getApiErrorMessage } from "@/lib/api";
import { mapCommunityFromApi, mapPostFromApi, mapUserFromApi } from "@/lib/apiMappers";

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
  viewerId: string;
}): Promise<SearchPostsResult | SearchPeopleResult | SearchCommunitiesResult> {
  const q = params.query.trim();
  if (!q) {
    if (params.mode === "posts") return { posts: [] };
    if (params.mode === "people") return { people: [] };
    return { communities: [] };
  }

  try {
    const { data } = await api.get("/search", {
      params: { q, mode: params.mode },
    });

    if (params.mode === "posts") {
      const posts = (data.posts ?? []).map((p: unknown) =>
        mapPostFromApi(p as Record<string, unknown>, params.viewerId)
      );
      return { posts };
    }
    if (params.mode === "people") {
      const people = (data.people ?? []).map((u: unknown) => mapUserFromApi(u as Record<string, unknown>));
      return { people };
    }
    const communities = (data.communities ?? []).map((c: unknown) =>
      mapCommunityFromApi(c as Record<string, unknown>)
    );
    return { communities };
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Falha na pesquisa."));
  }
}
