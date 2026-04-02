import type { Post, PostInteractionState } from "../types";

/** Extrai o trio de engajamento como objeto estável para `useMemo` / contexto de post. */
export function pickPostInteractionState(post: Post): PostInteractionState {
  return {
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    likedByCurrentUser: post.likedByCurrentUser,
  };
}
