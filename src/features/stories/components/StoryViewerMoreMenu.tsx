import { useEffect, useState } from "react";
import { MoreVertical, Trash2 } from "lucide-react";
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
import { DeleteStoryConfirmationDialog } from "./DeleteStoryConfirmationDialog";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

export interface StoryViewerMoreMenuProps {
  storyId: string;
  disabled?: boolean;
  onDeleted: () => void;
  /** Pausa o progresso do story enquanto o menu/confirmação está aberto. */
  onInteractionChange?: (blocked: boolean) => void;
}

export function StoryViewerMoreMenu({
  storyId,
  disabled = false,
  onDeleted,
  onInteractionChange,
}: StoryViewerMoreMenuProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    onInteractionChange?.(confirmOpen || isDeleting);
  }, [confirmOpen, isDeleting, onInteractionChange]);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteStory(storyId);
      setConfirmOpen(false);
      showSuccessToast("Story excluído.", { id: `woody-story-deleted-${storyId}` });
      onDeleted();
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : "Não foi possível excluir este story.", {
        id: `woody-story-delete-err-${storyId}`,
      });
    } finally {
      setIsDeleting(false);
    }
  };

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
