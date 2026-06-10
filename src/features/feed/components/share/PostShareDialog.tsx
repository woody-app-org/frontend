import { Send, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Post } from "@/domain/types";
import { cn } from "@/lib/utils";
import { ShareToWoodyPanel, type ShareToWoodyTarget } from "./ShareToWoodyPanel";

export interface PostShareDialogProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareStep: "menu" | "woody";
  onShareStepChange: (step: "menu" | "woody") => void;
  isSendingToWoody: boolean;
  onShareToStory: () => void;
  onSendToWoody: (target: ShareToWoodyTarget, message: string) => void;
}

export function PostShareDialog({
  post: _post,
  open,
  onOpenChange,
  shareStep,
  onShareStepChange,
  isSendingToWoody,
  onShareToStory,
  onSendToWoody,
}: PostShareDialogProps) {
  const busy = isSendingToWoody;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "gap-4 border-[var(--woody-accent)]/15 bg-[var(--woody-card)] sm:max-w-md",
          "max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-2xl"
        )}
      >
        {shareStep === "menu" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-[var(--woody-text)] mb-3">Compartilhar publicação</DialogTitle>
              <DialogDescription className="sr-only">Escolha como compartilhar esta publicação</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-auto justify-start gap-3 px-4 py-3 text-left"
                disabled={busy}
                onClick={() => onShareStepChange("woody")}
              >
                <Send className="size-5 shrink-0 text-[var(--woody-nav)]" aria-hidden />
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium text-[var(--woody-text)]">Compartilhar com amigos</span>
                  <span className="text-xs font-normal text-[var(--woody-muted)]">
                    Enviar para uma pessoa ou conversa
                  </span>
                </span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-auto justify-start gap-3 px-4 py-3 text-left"
                disabled={busy}
                onClick={() => onShareToStory()}
              >
                <Sparkles className="size-5 shrink-0 text-[var(--woody-nav)]" aria-hidden />
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium text-[var(--woody-text)]">Compartilhar no story</span>
                  <span className="text-xs font-normal text-[var(--woody-muted)]">
                    Publicar no seu story por 24 horas
                  </span>
                </span>
              </Button>
            </div>
          </>
        ) : (
          <ShareToWoodyPanel
            onSend={onSendToWoody}
            isSending={isSendingToWoody}
            onBack={() => onShareStepChange("menu")}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
