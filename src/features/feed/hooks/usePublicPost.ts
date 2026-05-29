import { useCallback, useEffect, useMemo, useState } from "react";
import type { Post } from "@/domain/types";
import { getPostByPublicId } from "@/domain/services/postMock.service";
import { isLegacyNumericPostParam, postPathForPost } from "@/features/feed/lib/postPaths";

interface UsePublicPostReturn {
  post: Post | null;
  isLoading: boolean;
  loadFailed: boolean;
  postUrlRedirect: string | null;
  refetch: () => Promise<void>;
}

/** Leitura de post para visitantes sem sessão (sem comentários nem mutações). */
export function usePublicPost(routeHandle: string | undefined): UsePublicPostReturn {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const postUrlRedirect = useMemo(() => {
    if (!post) return null;
    if (routeHandle && isLegacyNumericPostParam(routeHandle) && post.publicId?.trim()) {
      return postPathForPost(post);
    }
    return null;
  }, [post, routeHandle]);

  const refetch = useCallback(async () => {
    if (!routeHandle) {
      setPost(null);
      setIsLoading(false);
      setLoadFailed(false);
      return;
    }

    setIsLoading(true);
    setLoadFailed(false);

    try {
      const data = await getPostByPublicId(routeHandle, "");
      setPost(data);
    } catch {
      setLoadFailed(true);
      setPost(null);
    } finally {
      setIsLoading(false);
    }
  }, [routeHandle]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { post, isLoading, loadFailed, postUrlRedirect, refetch };
}
