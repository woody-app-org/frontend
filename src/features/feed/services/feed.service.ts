import type { PaginatedResponse, Post, FeedFilter } from "../types";

const MOCK_USER = {
  id: "1",
  name: "Seu nome",
  avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  pronouns: "ela/dela",
};

const MOCK_POSTS: Post[] = [
  {
    id: "1",
    author: MOCK_USER,
    title: "Tópico",
    content:
      "A great book and a great coffee! What a way to begin the day :)",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
    topic: "Tópico",
    createdAt: "2h atrás",
    likesCount: 3500,
    commentsCount: 3500,
  },
  {
    id: "2",
    author: {
      id: "2",
      name: "Débora da Silva",
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
    title: "Lorem ipsum mipus merol remips hanrs?",
    content:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit risus potenti sagittis lacus tempor.",
    imageUrl: null,
    createdAt: "2h atrás",
    likesCount: 42,
    commentsCount: 12,
  },
  {
    id: "3",
    author: MOCK_USER,
    title: "Tópico",
    content:
      "A great book and a great coffee! What a way to begin the day :)",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
    topic: "Tópico",
    createdAt: "5h atrás",
    likesCount: 1200,
    commentsCount: 89,
  },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getFeed(
  page: number,
  _filter: FeedFilter
): Promise<PaginatedResponse<Post>> {
  await delay(600);

  const pageSize = 10;
  const totalCount = MOCK_POSTS.length * 3;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = [...MOCK_POSTS, ...MOCK_POSTS.map((p, i) => ({ ...p, id: `${p.id}-${i + 10}` })), ...MOCK_POSTS.map((p, i) => ({ ...p, id: `${p.id}-${i + 20}` }))].slice(
    start,
    end
  );

  return {
    items,
    page,
    pageSize,
    totalCount,
    hasNextPage: end < totalCount,
    hasPreviousPage: page > 1,
  };
}
