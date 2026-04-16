import { useCallback, useEffect, useState } from "react";
import { followUser, unfollowUser } from "../services/follow.service";

export interface UseProfileFollowOptions {
  targetUserId: string;
  /** Só corre pedidos quando a utilizadora vê outro perfil com sessão. */
  enabled: boolean;
  initialIsFollowing: boolean | undefined;
  initialFollowersCount: number | undefined;
  /** Mantém o objeto de perfil em sincronia após sucesso na API. */
  onCommit: (patch: { isFollowing: boolean; followersCount: number }) => void;
}

export interface UseProfileFollowResult {
  isFollowing: boolean;
  followersCount: number;
  busy: boolean;
  error: string | null;
  clearError: () => void;
  toggleFollow: () => Promise<void>;
}

/**
 * Estado de seguir para o cabeçalho do perfil: parte do `GET /users/:id` e atualiza
 * com `POST`/`DELETE .../follow` (podes usar `fetchFollowStatus` à parte se precisares só do estado).
 */
export function useProfileFollow({
  targetUserId,
  enabled,
  initialIsFollowing,
  initialFollowersCount,
  onCommit,
}: UseProfileFollowOptions): UseProfileFollowResult {
  const [isFollowing, setIsFollowing] = useState(Boolean(initialIsFollowing));
  const [followersCount, setFollowersCount] = useState(initialFollowersCount ?? 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsFollowing(Boolean(initialIsFollowing));
    setFollowersCount(initialFollowersCount ?? 0);
    setError(null);
  }, [targetUserId, initialIsFollowing, initialFollowersCount]);

  const clearError = useCallback(() => setError(null), []);

  const toggleFollow = useCallback(async () => {
    if (!enabled || busy) return;

    const wasFollowing = isFollowing;
    const nextFollowing = !wasFollowing;
    setBusy(true);
    setError(null);
    setIsFollowing(nextFollowing);

    try {
      const r = nextFollowing ? await followUser(targetUserId) : await unfollowUser(targetUserId);
      setIsFollowing(r.isFollowing);
      setFollowersCount(r.followersCount);
      onCommit({
        isFollowing: r.isFollowing,
        followersCount: r.followersCount,
      });
    } catch (err) {
      setIsFollowing(wasFollowing);
      setError(err instanceof Error ? err.message : "Algo correu mal.");
    } finally {
      setBusy(false);
    }
  }, [enabled, busy, isFollowing, targetUserId, onCommit]);

  return {
    isFollowing,
    followersCount,
    busy,
    error,
    clearError,
    toggleFollow,
  };
}
