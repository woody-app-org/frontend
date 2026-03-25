export type { User, Post } from "@/domain/types";

export type FeedFilter = "trending" | "forYou" | "following";

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface FeedState {
  filter: FeedFilter;
  page: number;
}
