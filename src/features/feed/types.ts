export type FeedFilter = "trending" | "forYou" | "following";

export interface User {
  id: string;
  name: string;
  avatarUrl: string | null;
  pronouns?: string;
}

export interface Post {
  id: string;
  author: User;
  title: string;
  content: string;
  imageUrl: string | null;
  topic?: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
}

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
