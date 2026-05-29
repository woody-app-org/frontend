import type { Post } from "@/domain/types";

export function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: "1",
    publicId: "pst_test00000001",
    publicationContext: "profile",
    communityId: null,
    authorId: "10",
    author: { id: "10", name: "Ana Silva", username: "ana", avatarUrl: null },
    content: "Olá Woody",
    imageUrl: null,
    createdAt: "1 jan 2026",
    likesCount: 2,
    commentsCount: 1,
    likedByCurrentUser: false,
    ...overrides,
  };
}
