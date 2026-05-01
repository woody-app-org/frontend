import { useState, useCallback, useEffect } from "react";
import type { Post, UseUserProfileReturn } from "../types";
import { useViewerId } from "@/features/auth/hooks/useViewerId";
import { getProfile, getProfilePosts } from "../services/profile.service";
import { pinPostOnProfile, unpinPostFromProfile } from "@/features/feed/services/postPin.service";
import { usePostListLikeToggle } from "@/features/feed/hooks/usePostListLikeToggle";

export function useUserProfile(userId: string | undefined): UseUserProfileReturn {
  const viewerId = useViewerId();
  const [profile, setProfile] = useState<UseUserProfileReturn["profile"]>(null);
  const [pinnedPosts, setPinnedPosts] = useState<Post[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [pinningPostId, setPinningPostId] = useState<string | null>(null);
  const [pinActionError, setPinActionError] = useState<string | null>(null);
  const [pinActionSuccess, setPinActionSuccess] = useState<string | null>(null);

  const { togglePostLike, isPostLikePending } = usePostListLikeToggle(setPosts, setPinnedPosts);

  const loadPosts = useCallback(
    async (targetUserId: string, targetPage: number): Promise<void> => {
      const postsData = await getProfilePosts(targetUserId, targetPage, 10, viewerId);
      setPinnedPosts(postsData.pinned);
      setPosts(postsData.items);
      setHasNextPage(postsData.hasNextPage);
      setHasPreviousPage(postsData.hasPreviousPage);
    },
    [viewerId]
  );

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setPinnedPosts([]);
      setPosts([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [profileData] = await Promise.all([getProfile(userId), loadPosts(userId, 1)]);
      setProfile(profileData);
      setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Falha ao carregar perfil"));
    } finally {
      setIsLoading(false);
    }
  }, [userId, loadPosts]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const fetchPostsPage = useCallback(async () => {
    if (!userId) return;
    try {
      await loadPosts(userId, page);
    } catch {
      // mantém listas atuais em caso de erro de paginação
    }
  }, [userId, page, loadPosts]);

  useEffect(() => {
    if (!userId || page === 1) return;
    void fetchPostsPage();
  }, [userId, page, fetchPostsPage]);

  const nextPage = useCallback(() => setPage((p) => p + 1), []);
  const previousPage = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const refetch = useCallback(() => fetchProfile(), [fetchProfile]);

  const updatePostInList = useCallback((updated: Post) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setPinnedPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  const removePostFromList = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setPinnedPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  const toggleProfilePin = useCallback(
    async (post: Post) => {
      const wasPinned = Boolean(post.pinnedOnProfileAt);
      setPinActionError(null);
      setPinActionSuccess(null);
      setPinningPostId(post.id);
      try {
        if (wasPinned) {
          await unpinPostFromProfile(post.id);
        } else {
          await pinPostOnProfile(post.id);
        }
        if (userId) await loadPosts(userId, page);
        setPinActionSuccess(
          wasPinned ? "O destaque foi removido do teu perfil." : "Publicação destacada no perfil."
        );
      } catch (err) {
        setPinActionError(err instanceof Error ? err.message : "Não foi possível atualizar o destaque.");
      } finally {
        setPinningPostId(null);
      }
    },
    [userId, page, loadPosts]
  );

  const dismissPinActionError = useCallback(() => setPinActionError(null), []);
  const dismissPinActionSuccess = useCallback(() => setPinActionSuccess(null), []);

  const applyFollowPatch = useCallback((patch: { isFollowing: boolean; followersCount: number }) => {
    setProfile((p) =>
      p
        ? {
            ...p,
            isFollowing: patch.isFollowing,
            followersCount: patch.followersCount,
          }
        : null
    );
  }, []);

  return {
    profile,
    pinnedPosts,
    posts,
    isLoading,
    error,
    page,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    refetch,
    updatePostInList,
    removePostFromList,
    toggleProfilePin,
    pinningPostId,
    pinActionError,
    dismissPinActionError,
    pinActionSuccess,
    dismissPinActionSuccess,
    applyFollowPatch,
    togglePostLike,
    isPostLikePending,
  };
}
