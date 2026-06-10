import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Post } from "@/domain/types";
import type { SharedPostPreviewDto } from "@/features/messages/types";
import { sharePostToConversation } from "../services/postShare.service";
import type { ShareToWoodyTarget } from "../components/share/ShareToWoodyPanel";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { postInternalApiId } from "@/domain/services/postMock.service";

function buildSharedPostPreview(post: Post): SharedPostPreviewDto {
  const firstMedia = post.mediaAttachments?.[0];
  return {
    id: post.id,
    publicId: post.publicId ?? null,
    authorDisplayName: post.author.name,
    authorUsername: post.author.username,
    authorProfilePic: post.author.avatarUrl,
    contentPreview: post.content || null,
    firstMediaUrl: firstMedia?.url ?? post.imageUrl ?? null,
    firstMediaType: firstMedia?.mediaType ?? (post.imageUrl ? "image" : null),
    communityName: post.community?.name ?? null,
    isUnavailable: false,
  };
}

export function usePostShare(post: Post) {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [shareStep, setShareStep] = useState<"menu" | "woody">("menu");
  const [isSendingToWoody, setIsSendingToWoody] = useState(false);

  useEffect(() => {
    if (dialogOpen) return;
    setShareStep("menu");
  }, [dialogOpen]);

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

  const openStoryComposer = useCallback(() => {
    setDialogOpen(false);
    navigate("/stories/novo", {
      state: {
        sharedPost: {
          postId: postInternalApiId(post),
          preview: buildSharedPostPreview(post),
        },
      },
    });
  }, [navigate, post]);

  return {
    dialogOpen,
    setDialogOpen,
    shareStep,
    setShareStep,
    isSendingToWoody,
    openStoryComposer,
    sendToWoody,
  };
}
