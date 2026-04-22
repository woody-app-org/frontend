import { useCallback, useEffect, useState } from "react";
import { useViewerId } from "@/features/auth/hooks/useViewerId";
import type { Comment, Post } from "@/domain/types";
import {
  getPostByIdMock,
  postCommentsMockApi,
  togglePostLikeMock,
} from "@/domain/services/postMock.service";

interface UsePostDetailReturn {
  post: Post | null;
  comments: Comment[];
  /** Carregamento do post (bloqueia a página de detalhe até ter corpo). */
  isLoading: boolean;
  /** Carregamento assíncrono dos comentários (lista + mock delay). */
  isCommentsLoading: boolean;
  isMutatingLike: boolean;
  isCreatingComment: boolean;
  error: string | null;
  commentsError: string | null;
  refetch: () => Promise<void>;
  /** Recarrega só a lista de comentários (ex.: após destacar). */
  refetchComments: () => Promise<void>;
  toggleLike: () => Promise<void>;
  /** `parentCommentId` opcional para resposta (composer raiz envia `null`). */
  createComment: (body: string, parentCommentId?: string | null) => Promise<boolean>;
}

/**
 * Comentários: `postCommentsMockApi.listByPostId` + árvore na UI; criação com `create` (raiz ou reply).
 * @see postMock.service — mapa de endpoints futuros.
 */
export function usePostDetail(postId: string | undefined): UsePostDetailReturn {
  const viewerId = useViewerId();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const [isMutatingLike, setIsMutatingLike] = useState(false);
  const [isCreatingComment, setIsCreatingComment] = useState(false);
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

  const createComment = useCallback(
    async (body: string, parentCommentId?: string | null) => {
      if (!postId) return false;
      const trimmed = body.trim();
      if (!trimmed) return false;
      setIsCreatingComment(true);
      setError(null);
      try {
        const result = await postCommentsMockApi.create(postId, viewerId, trimmed, parentCommentId ?? null);
        if (!result.ok) {
          setError(result.error);
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
        return true;
      } catch {
        setError("Não foi possível publicar o comentário.");
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
    error,
    commentsError,
    refetch,
    refetchComments,
    toggleLike,
    createComment,
  };
}
