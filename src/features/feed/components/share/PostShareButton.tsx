import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Post } from "@/domain/types";
import { usePostShare } from "../../hooks/usePostShare";
import { PostShareDialog } from "./PostShareDialog";

export interface PostShareButtonProps {
  post: Post;
  /** Estilo do footer do card (`footerItem`) ou botão ghost no detalhe. */
  variant?: "card" | "detail";
  className?: string;
}

export function PostShareButton({ post, variant = "card", className }: PostShareButtonProps) {
  const {
    dialogOpen,
    setDialogOpen,
    shareUrl,
    canShareExternally,
    nativeShareAvailable,
    isCopying,
    isSharing,
    copyLink,
    shareOutside,
  } = usePostShare(post);

  const label = "Compartilhar publicação";

  return (
    <>
      {variant === "card" ? (
        <button
          type="button"
          data-post-ignore-open="true"
          className={cn(className)}
          aria-label={label}
          onClick={(event) => {
            event.stopPropagation();
            setDialogOpen(true);
          }}
        >
          <Share2 className="size-[1em] stroke-current" strokeWidth={1.75} />
        </button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn("gap-1.5 text-[var(--woody-text)]", className)}
          aria-label={label}
          onClick={() => setDialogOpen(true)}
        >
          <Share2 className="size-4" />
          <span className="hidden sm:inline">Compartilhar</span>
        </Button>
      )}

      <PostShareDialog
        post={post}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        shareUrl={shareUrl}
        canShareExternally={canShareExternally}
        nativeShareAvailable={nativeShareAvailable}
        isCopying={isCopying}
        isSharing={isSharing}
        onCopyLink={() => void copyLink()}
        onShareOutside={() => void shareOutside()}
      />
    </>
  );
}
