import type { Post } from "@/domain/types";
import { api, getApiErrorMessage } from "@/lib/api";
import { mapPostFromApi } from "@/lib/apiMappers";
import type { PaginatedResponse, FeedFilter } from "../types";

export async function getFeed(
  page: number,
  filter: FeedFilter,
  viewerId: string
): Promise<PaginatedResponse<Post>> {
  try {
    const { data } = await api.get("/feed", {
      params: { page, pageSize: 10, filter },
    });
    const items = (data.items ?? []).map((p: unknown) => mapPostFromApi(p as Record<string, unknown>, viewerId));
    return {
      items,
      page: data.page ?? page,
      pageSize: data.pageSize ?? 10,
      totalCount: data.totalCount ?? items.length,
      hasNextPage: Boolean(data.hasNextPage),
      hasPreviousPage: Boolean(data.hasPreviousPage),
    };
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Falha ao carregar o feed."));
  }
}
