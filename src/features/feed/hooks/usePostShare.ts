import { useCallback, useMemo, useState } from "react";
import type { Post } from "@/domain/types";
import {
  canSharePostExternally,
  canUseNativeShare,
  copyPostLinkToClipboard,
  resolveShareUrl,
  sharePostNatively,
} from "../lib/postShare";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

export function usePostShare(post: Post) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const shareUrl = useMemo(() => resolveShareUrl(post), [post]);
  const canShareExternally = useMemo(() => canSharePostExternally(post), [post]);
  const nativeShareAvailable = canUseNativeShare();

  const copyLink = useCallback(async () => {
    setIsCopying(true);
    try {
      await copyPostLinkToClipboard(post);
      showSuccessToast("Link copiado.", { id: `woody-share-copy-${post.id}` });
      setDialogOpen(false);
    } catch {
      showErrorToast("Não foi possível copiar o link.", { id: `woody-share-copy-err-${post.id}` });
    } finally {
      setIsCopying(false);
    }
  }, [post]);

  const shareOutside = useCallback(async () => {
    if (!canShareExternally) return;
    if (!nativeShareAvailable) {
      await copyLink();
      return;
    }
    setIsSharing(true);
    try {
      const result = await sharePostNatively(post);
      if (result === "shared") {
        showSuccessToast("Post compartilhado.", { id: `woody-share-native-${post.id}` });
        setDialogOpen(false);
      }
    } catch {
      showErrorToast("Não foi possível compartilhar.", { id: `woody-share-native-err-${post.id}` });
    } finally {
      setIsSharing(false);
    }
  }, [post, canShareExternally, nativeShareAvailable, copyLink]);

  return {
    dialogOpen,
    setDialogOpen,
    shareUrl,
    canShareExternally,
    nativeShareAvailable,
    isCopying,
    isSharing,
    copyLink,
    shareOutside,
  };
}
