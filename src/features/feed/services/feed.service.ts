import type { Post } from "@/domain/types";
import { getAllSeedPostsEnriched, getCommunityIdsForUser, getFollowingUserIds } from "@/domain/selectors";
import type { PaginatedResponse, FeedFilter } from "../types";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function engagementScore(p: Post): number {
  return p.likesCount + p.commentsCount * 2;
}

function applyFeedFilter(all: Post[], filter: FeedFilter, viewerId: string): Post[] {
  switch (filter) {
    case "trending":
      return [...all].sort((a, b) => engagementScore(b) - engagementScore(a));
    case "forYou": {
      const mine = new Set(getCommunityIdsForUser(viewerId));
      const fromJoined = all
        .filter((p) => mine.has(p.communityId))
        .sort((a, b) => engagementScore(b) - engagementScore(a));
      const discover = all
        .filter((p) => !mine.has(p.communityId))
        .sort((a, b) => engagementScore(b) - engagementScore(a));
      const seen = new Set<string>();
      const merged: Post[] = [];
      for (const p of [...fromJoined, ...discover]) {
        if (seen.has(p.id)) continue;
        seen.add(p.id);
        merged.push(p);
      }
      return merged;
    }
    case "following": {
      const following = new Set(getFollowingUserIds(viewerId));
      return all
        .filter((p) => following.has(p.author.id))
        .sort((a, b) => engagementScore(b) - engagementScore(a));
    }
    default:
      return all;
  }
}

export async function getFeed(
  page: number,
  filter: FeedFilter,
  viewerId: string
): Promise<PaginatedResponse<Post>> {
  await delay(420);
  const all = getAllSeedPostsEnriched(viewerId);
  const pool = applyFeedFilter(all, filter, viewerId);
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
