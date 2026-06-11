import { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  ShareToWoodyPanel,
  type ShareToWoodyTarget,
} from "@/features/feed/components/share/ShareToWoodyPanel";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { shareStoryToConversation } from "../services/stories.service";
import type { Story } from "../types";

export interface StoryShareDialogProps {
  story: Story | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Envia o story para outra pessoa/conversa por DM (o autor não é avisado). */
export function StoryShareDialog({ story, open, onOpenChange }: StoryShareDialogProps) {
  const [isSending, setIsSending] = useState(false);

  const handleSend = useCallback(
    async (target: ShareToWoodyTarget, message: string) => {
      if (!story || isSending) return;
      setIsSending(true);
      try {
        const payload =
          target.kind === "conversation"
            ? { conversationId: target.conversationId, message: message || undefined }
            : { recipientUserId: target.recipientUserId, message: message || undefined };
        await shareStoryToConversation(story.id, payload);
        showSuccessToast("Story enviado.", { id: `woody-story-share-${story.id}` });
        onOpenChange(false);
      } catch (e) {
        showErrorToast(e instanceof Error ? e.message : "Não foi possível enviar este story.", {
          id: `woody-story-share-err-${story.id}`,
        });
      } finally {
        setIsSending(false);
      }
    },
    [story, isSending, onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "z-[120] gap-4 border-[var(--woody-accent)]/15 bg-[var(--woody-card)] sm:max-w-md",
          "max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-2xl"
        )}
        overlayClassName="z-[119]"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle className="text-[var(--woody-text)]">Compartilhar story</DialogTitle>
          <DialogDescription className="sr-only">
            Envie este story para uma pessoa ou conversa dentro da Woody
          </DialogDescription>
        </DialogHeader>
        <ShareToWoodyPanel
          onSend={(target, message) => void handleSend(target, message)}
          isSending={isSending}
          onBack={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
