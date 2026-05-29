import { Copy, Send, Share2 } from "lucide-react";
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
  shareUrl: string;
  canShareExternally: boolean;
  nativeShareAvailable: boolean;
  isCopying: boolean;
  isSharing: boolean;
  isSendingToWoody: boolean;
  onCopyLink: () => void;
  onShareOutside: () => void;
  onSendToWoody: (target: ShareToWoodyTarget, message: string) => void;
}

export function PostShareDialog({
  post,
  open,
  onOpenChange,
  shareStep,
  onShareStepChange,
  shareUrl,
  canShareExternally,
  nativeShareAvailable,
  isCopying,
  isSharing,
  isSendingToWoody,
  onCopyLink,
  onShareOutside,
  onSendToWoody,
}: PostShareDialogProps) {
  const busy = isCopying || isSharing || isSendingToWoody;

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
              <DialogTitle className="text-[var(--woody-text)]">Compartilhar publicação</DialogTitle>
              <DialogDescription className="text-[var(--woody-muted)]">
                Partilha esta publicação com quem quiseres.
              </DialogDescription>
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
                  <span className="font-medium text-[var(--woody-text)]">Enviar dentro da Woody</span>
                  <span className="text-xs font-normal text-[var(--woody-muted)]">
                    Partilha por mensagem directa
                  </span>
                </span>
              </Button>

              {canShareExternally ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto justify-start gap-3 px-4 py-3 text-left"
                  disabled={busy}
                  onClick={() => void onShareOutside()}
                >
                  <Share2 className="size-5 shrink-0 text-[var(--woody-nav)]" aria-hidden />
                  <span className="flex flex-col gap-0.5">
                    <span className="font-medium text-[var(--woody-text)]">Compartilhar fora da Woody</span>
                    <span className="text-xs font-normal text-[var(--woody-muted)]">
                      {nativeShareAvailable
                        ? "Abre as opções do teu dispositivo"
                        : "Copia o link (partilha nativa indisponível)"}
                    </span>
                  </span>
                </Button>
              ) : null}

              <Button
                type="button"
                variant="outline"
                className="h-auto justify-start gap-3 px-4 py-3 text-left"
                disabled={busy}
                onClick={() => void onCopyLink()}
              >
                <Copy className="size-5 shrink-0 text-[var(--woody-nav)]" aria-hidden />
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium text-[var(--woody-text)]">Copiar link</span>
                  <span className="truncate text-xs font-normal text-[var(--woody-muted)]">{shareUrl}</span>
                </span>
              </Button>
            </div>

            {!canShareExternally && post.publicationContext === "community" ? (
              <p className="text-xs leading-relaxed text-[var(--woody-muted)]">
                Esta publicação é de um espaço com acesso restrito. Podes copiar o link para quem já tem
                acesso na Woody.
              </p>
            ) : null}
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
