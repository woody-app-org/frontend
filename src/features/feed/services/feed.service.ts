import type { Post } from "@/domain/types";
import { getAllSeedPostsEnriched } from "@/domain/selectors";
import type { PaginatedResponse, FeedFilter } from "../types";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function expandFeedPool(base: Post[]): Post[] {
  return [
    ...base,
    ...base.map((p, i) => ({ ...p, id: `${p.id}-dup1-${i}` })),
    ...base.map((p, i) => ({ ...p, id: `${p.id}-dup2-${i}` })),
  ];
}

export async function getFeed(
  page: number,
  _filter: FeedFilter
): Promise<PaginatedResponse<Post>> {
  await delay(600);

  const pool = expandFeedPool(getAllSeedPostsEnriched());
  const pageSize = 10;
  const totalCount = pool.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = pool.slice(start, end);

  return {
    items,
    page,
    pageSize,
    totalCount,
    hasNextPage: end < totalCount,
    hasPreviousPage: page > 1,
  };
}
