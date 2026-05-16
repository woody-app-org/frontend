import { useCallback, useEffect, useState } from "react";
import { useViewerId } from "@/features/auth/hooks/useViewerId";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { Comment, CommentGifDraft, Post } from "@/domain/types";
import {
  getPostByIdMock,
  postCommentsMockApi,
  togglePostLikeMock,
  likeComment,
  unlikeComment,
} from "@/domain/services/postMock.service";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

interface UsePostDetailReturn {
  post: Post | null;
  comments: Comment[];
  /** Carregamento do post (bloqueia a página de detalhe até ter corpo). */
  isLoading: boolean;
  /** Carregamento assíncrono dos comentários (lista + mock delay). */
  isCommentsLoading: boolean;
  isMutatingLike: boolean;
  isCreatingComment: boolean;
  /** Comentários com toggle de gosto em curso (UI desactiva o botão). */
  commentLikePendingIds: ReadonlySet<string>;
  error: string | null;
  commentsError: string | null;
  refetch: () => Promise<void>;
  /** Recarrega só a lista de comentários (ex.: após destacar). */
  refetchComments: () => Promise<void>;
  toggleLike: () => Promise<void>;
  toggleCommentLike: (commentId: string) => Promise<void>;
  /** `parentCommentId` opcional para resposta (composer raiz envia `null`). Terceiro argumento: GIF opcional. */
  createComment: (
    body: string,
    parentCommentId?: string | null,
    gif?: CommentGifDraft | null
  ) => Promise<boolean>;
}

/**
 * Comentários: `postCommentsMockApi.listByPostId` + árvore na UI; criação com `create` (raiz ou reply).
 * @see postMock.service — mapa de endpoints futuros.
 */
export function usePostDetail(postId: string | undefined): UsePostDetailReturn {
  const viewerId = useViewerId();
  const { isAuthenticated } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
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

  /** Recarrega comentários sem skeleton (evita flash após destacar). */
  const refetchComments = useCallback(async () => {
    if (!postId) {
      setComments([]);
      return;
    }
    setCommentsError(null);
    try {
      const commentsData = await postCommentsMockApi.listByPostId(postId, viewerId);
      setComments(commentsData);
    } catch {
      setCommentsError("Não foi possível carregar os comentários.");
      setComments([]);
    }
  }, [postId, viewerId]);

  const refetch = useCallback(async () => {
    if (!postId) {
      setPost(null);
      setComments([]);
      setIsLoading(false);
      setIsCommentsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsCommentsLoading(true);
    setError(null);
    setCommentsError(null);

    const postTask = getPostByIdMock(postId, viewerId)
      .then((postData) => {
        setPost(postData);
        return postData;
      })
      .catch(() => {
        setError("Não foi possível carregar o post.");
        setPost(null);
      })
      .finally(() => {
        setIsLoading(false);
      });

    const commentsTask = postCommentsMockApi
      .listByPostId(postId, viewerId)
      .then((commentsData) => {
        setComments(commentsData);
      })
      .catch(() => {
        setCommentsError("Não foi possível carregar os comentários.");
        setComments([]);
      })
      .finally(() => {
        setIsCommentsLoading(false);
      });

    await Promise.all([postTask, commentsTask]);
  }, [postId, viewerId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const toggleLike = useCallback(async () => {
    if (!postId || !post) return;
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
      const result = await togglePostLikeMock(postId, viewerId);
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
  }, [postId, post, viewerId]);

  const toggleCommentLike = useCallback(
    async (commentId: string) => {
      if (!postId) return;
      if (!isAuthenticated) {
        showErrorToast("Inicia sessão para curtir comentários.", { id: `woody-cmt-like-auth-${postId}` });
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
          ? await unlikeComment(postId, commentId)
          : await likeComment(postId, commentId);
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
          id: `woody-cmt-like-err-${postId}-${commentId}`,
        });
      } finally {
        setCommentLikePendingIds((prev) => {
          const n = new Set(prev);
          n.delete(commentId);
          return n;
        });
      }
    },
    [postId, isAuthenticated]
  );

  const createComment = useCallback(
    async (body: string, parentCommentId?: string | null, gif?: CommentGifDraft | null) => {
      if (!postId) return false;
      const trimmed = body.trim();
      const hasGif = Boolean(gif?.gifUrl?.trim());
      if (!trimmed && !hasGif) return false;
      setIsCreatingComment(true);
      try {
        const result = await postCommentsMockApi.create(
          postId,
          viewerId,
          trimmed,
          parentCommentId ?? null,
          gif ?? null
        );
        if (!result.ok) {
          showErrorToast(result.error, { id: `woody-comment-err-${postId}` });
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
        showSuccessToast("Comentário publicado.", { id: `woody-comment-ok-${postId}` });
        return true;
      } catch {
        showErrorToast("Não foi possível publicar o comentário.", { id: `woody-comment-ex-${postId}` });
        return false;
      } finally {
        setIsCreatingComment(false);
      }
    },
    [postId, viewerId]
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
    refetch,
    refetchComments,
    toggleLike,
    toggleCommentLike,
    createComment,
  };
}
