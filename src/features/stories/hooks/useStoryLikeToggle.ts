import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { showErrorToast } from "@/lib/toast";
import { likeStory, unlikeStory } from "../services/stories.service";
import type { Story } from "../types";

type StorySetter = Dispatch<SetStateAction<Story[]>>;

/**
 * Alterna a curtida de um story com atualização otimista e rollback em caso de erro.
 * Mantém uma ou mais listas de stories em sincronia (ex.: viewer + lista de stories do perfil).
 *
 * Padronizado com `usePostListLikeToggle`/`usePostDetail.toggleCommentLike`: o servidor é
 * a fonte de verdade (`TryAddStoryLikeAsync`/`RemoveStoryLikeAsync` são idempotentes e
 * resistentes a corridas), e o estado local apenas reflete otimisticamente até a resposta chegar.
 */
export function useStoryLikeToggle(...setters: StorySetter[]) {
  const settersRef = useRef(setters);
  settersRef.current = setters;

  const [pendingStoryIds, setPendingStoryIds] = useState<ReadonlySet<string>>(new Set());

  const applyAll = useCallback((mapList: (prev: Story[]) => Story[]) => {
    for (const set of settersRef.current) {
      set(mapList);
    }
  }, []);

  const applyState = useCallback(
    (storyId: string, likedByCurrentUser: boolean, likesCount: number) => {
      applyAll((current) =>
        current.map((story) =>
          story.id !== storyId ? story : { ...story, likedByCurrentUser, likesCount }
        )
      );
    },
    [applyAll]
  );

  const toggleStoryLike = useCallback(
    async (story: Story) => {
      const storyId = story.id;
      if (!storyId || pendingStoryIds.has(storyId)) return;

      const before = { likedByCurrentUser: story.likedByCurrentUser, likesCount: story.likesCount };
      const optimisticLiked = !before.likedByCurrentUser;
      const optimisticCount = optimisticLiked
        ? before.likesCount + 1
        : Math.max(0, before.likesCount - 1);

      setPendingStoryIds((current) => new Set(current).add(storyId));
      applyState(storyId, optimisticLiked, optimisticCount);

      try {
        const result = optimisticLiked ? await likeStory(storyId) : await unlikeStory(storyId);
        applyState(storyId, result.likedByCurrentUser, result.likesCount);
      } catch (e) {
        applyState(storyId, before.likedByCurrentUser, before.likesCount);
        showErrorToast(e instanceof Error ? e.message : "Não foi possível curtir este story.", {
          id: `woody-story-like-err-${storyId}`,
        });
      } finally {
        setPendingStoryIds((current) => {
          const next = new Set(current);
          next.delete(storyId);
          return next;
        });
      }
    },
    [applyState, pendingStoryIds]
  );

  const isStoryLikePending = useCallback(
    (storyId: string) => pendingStoryIds.has(storyId),
    [pendingStoryIds]
  );

  return { toggleStoryLike, isStoryLikePending };
}
