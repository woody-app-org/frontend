import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { useViewerId } from "@/features/auth/hooks/useViewerId";
import { togglePostLikeMock } from "@/domain/services/postMock.service";
import type { Post } from "../types";

type PostListSetter = Dispatch<SetStateAction<Post[]>>;

/**
 * Alterna curtida em mock/API e mantém uma ou mais listas de posts em sincronia (feed, comunidade, perfil).
 */
export function usePostListLikeToggle(...setters: PostListSetter[]) {
  const viewerId = useViewerId();
  const settersRef = useRef(setters);
  settersRef.current = setters;

  const [pendingLikePostIds, setPendingLikePostIds] = useState<Set<string>>(new Set());

  const applyAll = useCallback((mapList: (prev: Post[]) => Post[]) => {
    for (const set of settersRef.current) {
      set(mapList);
    }
  }, []);

  const togglePostLike = useCallback(
    async (postId: string) => {
      if (!postId) return;
      if (pendingLikePostIds.has(postId)) return;

      setPendingLikePostIds((current) => {
        const next = new Set(current);
        next.add(postId);
        return next;
      });

      applyAll((current) =>
        current.map((post) =>
          post.id !== postId
            ? post
            : {
                ...post,
                likedByCurrentUser: !post.likedByCurrentUser,
                likesCount: post.likedByCurrentUser ? Math.max(0, post.likesCount - 1) : post.likesCount + 1,
              }
        )
      );

      try {
        const result = await togglePostLikeMock(postId, viewerId);
        if (!result) throw new Error("Post não encontrado.");
        applyAll((current) =>
          current.map((post) =>
            post.id !== postId
              ? post
              : {
                  ...post,
                  likedByCurrentUser: result.likedByCurrentUser,
                  likesCount: result.likesCount,
                }
          )
        );
      } catch {
        applyAll((current) =>
          current.map((post) =>
            post.id !== postId
              ? post
              : {
                  ...post,
                  likedByCurrentUser: !post.likedByCurrentUser,
                  likesCount: post.likedByCurrentUser ? Math.max(0, post.likesCount - 1) : post.likesCount + 1,
                }
          )
        );
      } finally {
        setPendingLikePostIds((current) => {
          const next = new Set(current);
          next.delete(postId);
          return next;
        });
      }
    },
    [applyAll, pendingLikePostIds, viewerId]
  );

  const isPostLikePending = useCallback(
    (postId: string) => pendingLikePostIds.has(postId),
    [pendingLikePostIds]
  );

  return { togglePostLike, isPostLikePending };
}
