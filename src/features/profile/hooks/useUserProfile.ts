import { useState, useCallback, useEffect, useMemo } from "react";
import type { Post, UseUserProfileReturn } from "../types";
import { useViewerId } from "@/features/auth/hooks/useViewerId";
import { getProfile, getProfileByUsername, getProfilePosts } from "../services/profile.service";
import { isLegacyNumericProfileParam, profilePath } from "../lib/profilePaths";
import { pinPostOnProfile, unpinPostFromProfile } from "@/features/feed/services/postPin.service";
import { usePostListLikeToggle } from "@/features/feed/hooks/usePostListLikeToggle";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

export type UseUserProfileReturnExtended = UseUserProfileReturn & {
  /** Quando definido, o cliente deve `replace` para a URL canónica por username. */
  profileUrlRedirect: string | null;
};

export function useUserProfile(routeHandle: string | undefined): UseUserProfileReturnExtended {
  const viewerId = useViewerId();
  const [profile, setProfile] = useState<UseUserProfileReturn["profile"]>(null);
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(null);
  const [pinnedPosts, setPinnedPosts] = useState<Post[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [pinningPostId, setPinningPostId] = useState<string | null>(null);

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
    if (!routeHandle) {
      setProfile(null);
      setResolvedUserId(null);
      setPinnedPosts([]);
      setPosts([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const profileData = isLegacyNumericProfileParam(routeHandle)
        ? await getProfile(routeHandle)
        : await getProfileByUsername(routeHandle);

      setProfile(profileData);
      setResolvedUserId(profileData?.id ?? null);
      setPage(1);

      if (profileData?.id) {
        await loadPosts(profileData.id, 1);
      } else {
        setPinnedPosts([]);
        setPosts([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Falha ao carregar perfil"));
    } finally {
      setIsLoading(false);
    }
  }, [routeHandle, loadPosts]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const fetchPostsPage = useCallback(async () => {
    if (!resolvedUserId) return;
    try {
      await loadPosts(resolvedUserId, page);
    } catch {
      // mantém listas atuais em caso de erro de paginação
    }
  }, [resolvedUserId, page, loadPosts]);

  useEffect(() => {
    if (!resolvedUserId || page === 1) return;
    void fetchPostsPage();
  }, [resolvedUserId, page, fetchPostsPage]);

  const profileUrlRedirect = useMemo(() => {
    if (!profile) return null;
    const canonical = profile.canonicalUsername?.trim();
    if (canonical) return profilePath(canonical);
    if (routeHandle && isLegacyNumericProfileParam(routeHandle)) {
      const username = profile.username?.trim();
      if (username) return profilePath(username);
    }
    return null;
  }, [profile, routeHandle]);

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

  const prependCreatedProfilePost = useCallback(
    (post: Post) => {
      if (!resolvedUserId) return;
      if (post.publicationContext !== "profile") return;
      if (post.author.id !== resolvedUserId) return;
      setPosts((prev) => {
        if (prev.some((p) => p.id === post.id)) return prev;
        return [post, ...prev];
      });
    },
    [resolvedUserId]
  );

  const toggleProfilePin = useCallback(
    async (post: Post) => {
      const wasPinned = Boolean(post.pinnedOnProfileAt);
      setPinningPostId(post.id);
      try {
        if (wasPinned) {
          await unpinPostFromProfile(post.id);
        } else {
          await pinPostOnProfile(post.id);
        }
        if (resolvedUserId) await loadPosts(resolvedUserId, page);
        showSuccessToast(
          wasPinned ? "Publicação removida dos destaques." : "Publicação fixada no perfil.",
          { id: `woody-profile-pin-${post.id}` }
        );
      } catch (err) {
        showErrorToast(
          err instanceof Error ? err.message : "Não foi possível atualizar o destaque.",
          { id: `woody-profile-pin-err-${post.id}` }
        );
      } finally {
        setPinningPostId(null);
      }
    },
    [resolvedUserId, page, loadPosts]
  );

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
    prependCreatedProfilePost,
    toggleProfilePin,
    pinningPostId,
    applyFollowPatch,
    togglePostLike,
    isPostLikePending,
    profileUrlRedirect,
  };
}
