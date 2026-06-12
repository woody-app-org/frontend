import { useEffect, useState } from "react";
import { Download, Loader2, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { deleteStory } from "../services/stories.service";
import { downloadStoryWithWatermark } from "../lib/storyDownload";
import type { Story } from "../types";
import { DeleteStoryConfirmationDialog } from "./DeleteStoryConfirmationDialog";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

export interface StoryViewerMoreMenuProps {
  story: Story;
  /** Só a autora pode excluir; baixar está disponível para todas. */
  canDelete: boolean;
  disabled?: boolean;
  onDeleted: () => void;
  /** Pausa o progresso do story enquanto o menu/confirmação/download está ativo. */
  onInteractionChange?: (blocked: boolean) => void;
}

export function StoryViewerMoreMenu({
  story,
  canDelete,
  disabled = false,
  onDeleted,
  onInteractionChange,
}: StoryViewerMoreMenuProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    onInteractionChange?.(confirmOpen || isDeleting || isDownloading);
  }, [confirmOpen, isDeleting, isDownloading, onInteractionChange]);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteStory(story.id);
      setConfirmOpen(false);
      showSuccessToast("Story excluído.", { id: `woody-story-deleted-${story.id}` });
      onDeleted();
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : "Não foi possível excluir este story.", {
        id: `woody-story-delete-err-${story.id}`,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadStoryWithWatermark(story);
      showSuccessToast("Story baixado.", { id: `woody-story-download-${story.id}` });
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : "Não foi possível baixar este story.", {
        id: `woody-story-download-err-${story.id}`,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Feature de download temporariamente desativada no front. Lógica mantida intacta
  // (handleDownload, downloadStoryWithWatermark) para reativação futura.
  const DOWNLOAD_FEATURE_ENABLED = false;
  const canDownload = DOWNLOAD_FEATURE_ENABLED && story.mediaType !== "shared_post";

  if (!canDelete && !canDownload) return null;

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled || isDeleting}
            className={cn(
              "size-10 shrink-0 rounded-full bg-black/35 text-white backdrop-blur-sm hover:bg-black/50 hover:text-white",
              woodyFocus.ring
            )}
            aria-label="Mais opções"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="size-5" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={6}
          className={cn(
            "z-[110] min-w-[11.5rem] border-white/12 bg-[#1c1c1c] text-white",
            "shadow-[0_8px_28px_rgba(0,0,0,0.45)]"
          )}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {canDownload ? (
            <DropdownMenuItem
              className="focus:bg-white/10 focus:text-white"
              disabled={isDownloading}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void handleDownload();
              }}
            >
              {isDownloading ? (
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              ) : (
                <Download className="mr-2 size-4" aria-hidden />
              )}
              {isDownloading ? "Preparando…" : "Baixar story"}
            </DropdownMenuItem>
          ) : null}

          {canDelete ? (
            <DropdownMenuItem
              variant="destructive"
              className="focus:bg-red-500/15 focus:text-red-300"
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setConfirmOpen(true);
              }}
            >
              <Trash2 className="mr-2 size-4" aria-hidden />
              Excluir story
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteStoryConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
