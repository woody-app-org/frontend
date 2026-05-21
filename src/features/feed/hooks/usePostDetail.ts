import { useCallback, useEffect, useMemo, useState } from "react";
import { useViewerId } from "@/features/auth/hooks/useViewerId";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { Comment, CommentGifDraft, Post } from "@/domain/types";
import {
  getPostByIdMock,
  getPostByPublicId,
  postCommentsMockApi,
  postInternalApiId,
  togglePostLikeMock,
  likeComment,
  unlikeComment,
} from "@/domain/services/postMock.service";
import { isLegacyNumericPostParam, postPathForPost } from "@/features/feed/lib/postPaths";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

interface UsePostDetailReturn {
  post: Post | null;
  comments: Comment[];
  isLoading: boolean;
  isCommentsLoading: boolean;
  isMutatingLike: boolean;
  isCreatingComment: boolean;
  commentLikePendingIds: ReadonlySet<string>;
  error: string | null;
  commentsError: string | null;
  /** Quando definido, o cliente deve `replace` para a URL canónica por publicId. */
  postUrlRedirect: string | null;
  refetch: () => Promise<void>;
  refetchComments: () => Promise<void>;
  toggleLike: () => Promise<void>;
  toggleCommentLike: (commentId: string) => Promise<void>;
  createComment: (
    body: string,
    parentCommentId?: string | null,
    gif?: CommentGifDraft | null
  ) => Promise<boolean>;
}

/**
 * Comentários e likes usam o id interno do post após carregamento; a rota pública usa publicId.
 */
export function usePostDetail(routeHandle: string | undefined): UsePostDetailReturn {
  const viewerId = useViewerId();
  const { isAuthenticated } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [internalPostId, setInternalPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const [isMutatingLike, setIsMutatingLike] = useState(false);
  const [isCreatingComment, setIsCreatingComment] = useState(false);
  const [commentLikePendingIds, setCommentLikePendingIds] = useState<ReadonlySet<string>>(
    () => new Set()
  );
  const [error, setError] = useState<string | null>(null);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  const postUrlRedirect = useMemo(() => {
    if (!post) return null;
    if (routeHandle && isLegacyNumericPostParam(routeHandle) && post.publicId?.trim()) {
      return postPathForPost(post);
    }
    return null;
  }, [post, routeHandle]);

  const refetchComments = useCallback(async () => {
    if (!internalPostId) {
      setComments([]);
      return;
    }
    setCommentsError(null);
    try {
      const commentsData = await postCommentsMockApi.listByPostId(internalPostId, viewerId);
      setComments(commentsData);
    } catch {
      setCommentsError("Não foi possível carregar os comentários.");
      setComments([]);
    }
  }, [internalPostId, viewerId]);

  const refetch = useCallback(async () => {
    if (!routeHandle) {
      setPost(null);
      setInternalPostId(null);
      setComments([]);
      setIsLoading(false);
      setIsCommentsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsCommentsLoading(true);
    setError(null);
    setCommentsError(null);

    const loadPost = isLegacyNumericPostParam(routeHandle)
      ? getPostByIdMock(routeHandle, viewerId)
      : getPostByPublicId(routeHandle, viewerId);

    const postTask = loadPost
      .then((postData) => {
        setPost(postData);
        setInternalPostId(postData ? postInternalApiId(postData) : null);
        return postData;
      })
      .catch(() => {
        setError("Não foi possível carregar o post.");
        setPost(null);
        setInternalPostId(null);
      })
      .finally(() => {
        setIsLoading(false);
      });

    const commentsTask = postTask.then(async (postData) => {
      if (!postData) {
        setComments([]);
        return;
      }
      try {
        const commentsData = await postCommentsMockApi.listByPostId(postInternalApiId(postData), viewerId);
        setComments(commentsData);
      } catch {
        setCommentsError("Não foi possível carregar os comentários.");
        setComments([]);
      } finally {
        setIsCommentsLoading(false);
      }
    });

    await Promise.all([postTask, commentsTask]);
  }, [routeHandle, viewerId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const toggleLike = useCallback(async () => {
    if (!internalPostId || !post) return;
    setIsMutatingLike(true);
    setError(null);
    const before = {
      likesCount: post.likesCount,
      likedByCurrentUser: post.likedByCurrentUser,
    };

    setPost({
      ...post,
      likesCount: post.likedByCurrentUser ? Math.max(0, post.likesCount - 1) : post.likesCount + 1,
      likedByCurrentUser: !post.likedByCurrentUser,
    });

    try {
      const result = await togglePostLikeMock(internalPostId, viewerId);
      if (!result) throw new Error("toggle like falhou");
      setPost((current) =>
        current
          ? {
              ...current,
              likesCount: result.likesCount,
              likedByCurrentUser: result.likedByCurrentUser,
            }
          : current
      );
    } catch {
      setPost((current) =>
        current
          ? {
              ...current,
              likesCount: before.likesCount,
              likedByCurrentUser: before.likedByCurrentUser,
            }
          : current
      );
      setError("Não foi possível atualizar a curtida.");
    } finally {
      setIsMutatingLike(false);
    }
  }, [internalPostId, post, viewerId]);

  const toggleCommentLike = useCallback(
    async (commentId: string) => {
      if (!internalPostId) return;
      if (!isAuthenticated) {
        showErrorToast("Inicia sessão para curtir comentários.", { id: `woody-cmt-like-auth-${internalPostId}` });
        return;
      }

      setCommentLikePendingIds((prev) => new Set(prev).add(commentId));
      let found = false;
      let snapshot: { likesCount: number; likedByCurrentUser: boolean } | null = null;
      let wasLiked = false;

      setComments((current) => {
        const idx = current.findIndex((c) => c.id === commentId);
        if (idx === -1) return current;
        found = true;
        const c = current[idx]!;
        wasLiked = c.likedByCurrentUser;
        snapshot = { likesCount: c.likesCount, likedByCurrentUser: wasLiked };
        const nextLiked = !wasLiked;
        const nextCount = nextLiked ? c.likesCount + 1 : Math.max(0, c.likesCount - 1);
        const next = [...current];
        next[idx] = { ...c, likesCount: nextCount, likedByCurrentUser: nextLiked };
        return next;
      });

      if (!found || snapshot === null) {
        setCommentLikePendingIds((prev) => {
          const n = new Set(prev);
          n.delete(commentId);
          return n;
        });
        return;
      }

      try {
        const result = wasLiked
          ? await unlikeComment(internalPostId, commentId)
          : await likeComment(internalPostId, commentId);
        setComments((current) => {
          const idx = current.findIndex((c) => c.id === commentId);
          if (idx === -1) return current;
          const next = [...current];
          const c = current[idx]!;
          next[idx] = {
            ...c,
            likesCount: result.likesCount,
            likedByCurrentUser: result.likedByCurrentUser,
          };
          return next;
        });
      } catch {
        setComments((current) => {
          const idx = current.findIndex((c) => c.id === commentId);
          if (idx === -1) return current;
          const next = [...current];
          next[idx] = { ...current[idx]!, ...snapshot };
          return next;
        });
        showErrorToast("Não foi possível curtir este comentário.", {
          id: `woody-cmt-like-err-${internalPostId}-${commentId}`,
        });
      } finally {
        setCommentLikePendingIds((prev) => {
          const n = new Set(prev);
          n.delete(commentId);
          return n;
        });
      }
    },
    [internalPostId, isAuthenticated]
  );

  const createComment = useCallback(
    async (body: string, parentCommentId?: string | null, gif?: CommentGifDraft | null) => {
      if (!internalPostId) return false;
      const trimmed = body.trim();
      const hasGif = Boolean(gif?.gifUrl?.trim());
      if (!trimmed && !hasGif) return false;
      setIsCreatingComment(true);
      try {
        const result = await postCommentsMockApi.create(
          internalPostId,
          viewerId,
          trimmed,
          parentCommentId ?? null,
          gif ?? null
        );
        if (!result.ok) {
          showErrorToast(result.error, { id: `woody-comment-err-${internalPostId}` });
          return false;
        }
        setCommentsError(null);
        setComments((current) => [...current, result.comment]);
        setPost((current) =>
          current
            ? {
                ...current,
                commentsCount: current.commentsCount + 1,
              }
            : current
        );
        showSuccessToast("Comentário publicado.", { id: `woody-comment-ok-${internalPostId}` });
        return true;
      } catch {
        showErrorToast("Não foi possível publicar o comentário.", { id: `woody-comment-ex-${internalPostId}` });
        return false;
      } finally {
        setIsCreatingComment(false);
      }
    },
    [internalPostId, viewerId]
  );

  return {
    post,
    comments,
    isLoading,
    isCommentsLoading,
    isMutatingLike,
    isCreatingComment,
    commentLikePendingIds,
    error,
    commentsError,
    postUrlRedirect,
    refetch,
    refetchComments,
    toggleLike,
    toggleCommentLike,
    createComment,
  };
}
