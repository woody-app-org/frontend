import { useCallback, useEffect, useMemo, useState } from "react";
import type { Post } from "@/domain/types";
import {
  canSharePostExternally,
  canUseNativeShare,
  copyPostLinkToClipboard,
  resolveShareUrl,
  sharePostNatively,
} from "../lib/postShare";
import { sharePostToConversation } from "../services/postShare.service";
import type { ShareToWoodyTarget } from "../components/share/ShareToWoodyPanel";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { postInternalApiId } from "@/domain/services/postMock.service";

export function usePostShare(post: Post) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [shareStep, setShareStep] = useState<"menu" | "woody">("menu");
  const [isCopying, setIsCopying] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSendingToWoody, setIsSendingToWoody] = useState(false);

  const shareUrl = useMemo(() => resolveShareUrl(post), [post]);
  const canShareExternally = useMemo(() => canSharePostExternally(post), [post]);
  const nativeShareAvailable = canUseNativeShare();

  useEffect(() => {
    if (dialogOpen) return;
    setShareStep("menu");
  }, [dialogOpen]);

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

  const sendToWoody = useCallback(
    async (target: ShareToWoodyTarget, message: string) => {
      setIsSendingToWoody(true);
      try {
        const body =
          target.kind === "conversation"
            ? {
                conversationId: target.conversationId,
                message: message || undefined,
              }
            : {
                recipientUserId: target.recipientUserId,
                message: message || undefined,
              };

        await sharePostToConversation(postInternalApiId(post), body);
        showSuccessToast("Publicação enviada.", { id: `woody-share-dm-${post.id}` });
        setDialogOpen(false);
      } catch (e) {
        showErrorToast(
          e instanceof Error ? e.message : "Não foi possível compartilhar esta publicação.",
          { id: `woody-share-dm-err-${post.id}` }
        );
      } finally {
        setIsSendingToWoody(false);
      }
    },
    [post]
  );

  return {
    dialogOpen,
    setDialogOpen,
    shareStep,
    setShareStep,
    shareUrl,
    canShareExternally,
    nativeShareAvailable,
    isCopying,
    isSharing,
    isSendingToWoody,
    copyLink,
    shareOutside,
    sendToWoody,
  };
}
