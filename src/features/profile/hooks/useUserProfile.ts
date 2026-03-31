import { useState, useCallback, useEffect } from "react";
import type { UseUserProfileReturn } from "../types";
import { useViewerId } from "@/features/auth/hooks/useViewerId";
import { getProfile, getProfilePosts } from "../services/profile.service";

export function useUserProfile(userId: string | undefined): UseUserProfileReturn {
  const viewerId = useViewerId();
  const [profile, setProfile] = useState<UseUserProfileReturn["profile"]>(null);
  const [posts, setPosts] = useState<UseUserProfileReturn["posts"]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setPosts([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [profileData, postsData] = await Promise.all([
        getProfile(userId),
        getProfilePosts(userId, 1, 10, viewerId),
      ]);
      setProfile(profileData);
      setPosts(postsData.items);
      setHasNextPage(postsData.hasNextPage);
      setHasPreviousPage(postsData.hasPreviousPage);
      setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Falha ao carregar perfil"));
    } finally {
      setIsLoading(false);
    }
  }, [userId, viewerId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const fetchPostsPage = useCallback(async () => {
    if (!userId) return;
    try {
      const postsData = await getProfilePosts(userId, page, 10, viewerId);
      setPosts(postsData.items);
      setHasNextPage(postsData.hasNextPage);
      setHasPreviousPage(postsData.hasPreviousPage);
    } catch {
      // mantém posts atuais em caso de erro de paginação
    }
  }, [userId, page, viewerId]);

  useEffect(() => {
    if (!userId || page === 1) return;
    fetchPostsPage();
  }, [userId, page, fetchPostsPage]);

  const nextPage = useCallback(() => setPage((p) => p + 1), []);
  const previousPage = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const refetch = useCallback(() => fetchProfile(), [fetchProfile]);

  return {
    profile,
    posts,
    isLoading,
    error,
    page,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    refetch,
  };
}
