import { useEffect, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { Flag, MoreVertical, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Post } from "@/domain/types";
import {
  canDeletePost,
  canEditPost,
  canReportPost,
} from "@/domain/contentModerationPermissions";
import {
  getContentReportsVersion,
  subscribeContentReports,
} from "@/domain/mocks/contentReportMockStore";
import { cn } from "@/lib/utils";
import { deletePostMock } from "@/domain/services/contentModerationMock.service";
import { EditPostDialog } from "./EditPostDialog";
import { DeletePostConfirmationDialog } from "./DeletePostConfirmationDialog";
import { ReportContentModal } from "./report/ReportContentModal";

export interface PostProfilePinMenuProps {
  isPinned: boolean;
  busy: boolean;
  onToggle: () => void | Promise<void>;
  /**
   * Chamado em `pointerdown` no item “Destacar no perfil”, antes do menu fechar.
   * Permite ao cartão ignorar o clique fantasma que abriria o detalhe do post (conteúdo do menu em portal).
   */
  onBeforeProfilePinPointerDown?: () => void;
}

export interface PostOverflowMenuProps {
  post: Post;
  viewerId: string;
  /** Fixação no perfil (API); tem prioridade sobre <code>onPin</code> legado. */
  profilePinMenu?: PostProfilePinMenuProps;
  onPin?: (postId: string) => void;
  triggerClassName?: string;
  /** Após exclusão bem-sucedida, navegar (ex.: `/feed` na página de detalhe). */
  deleteRedirectTo?: string;
  onPostUpdated?: (post: Post) => void;
  onPostDeleted?: (postId: string) => void;
  /**
   * No cartão do feed o clique propaga para abrir o post; no detalhe não.
   * @default true
   */
  stopTriggerPropagation?: boolean;
}

export function PostOverflowMenu({
  post,
  viewerId,
  profilePinMenu,
  onPin,
  triggerClassName,
  deleteRedirectTo,
  onPostUpdated,
  onPostDeleted,
  stopTriggerPropagation = true,
}: PostOverflowMenuProps) {
  const navigate = useNavigate();
  const reportRev = useSyncExternalStore(
    subscribeContentReports,
    getContentReportsVersion,
    getContentReportsVersion
  );
  void reportRev;

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const showEdit = canEditPost(viewerId, post);
  const showDelete = canDeletePost(viewerId, post);
  const showReport = canReportPost(viewerId, post);

  useEffect(() => {
    if (deleteOpen) setDeleteError(null);
  }, [deleteOpen]);

  const handleDelete = async () => {
    setDeleteError(null);
    setIsDeleting(true);
    try {
      const result = await deletePostMock(post.id, viewerId);
      if (!result.ok) {
        setDeleteError(result.message);
        return;
      }
      onPostDeleted?.(post.id);
      setDeleteOpen(false);
      if (deleteRedirectTo) navigate(deleteRedirectTo);
    } finally {
      setIsDeleting(false);
    }
  };

  const ownerExtras = showEdit || showDelete;
  const showProfilePin = Boolean(profilePinMenu);
  const legacyPin = Boolean(onPin);
  const pinRow = showProfilePin || legacyPin;
  /** Separa dona do post (editar/excluir) do bloco seguinte (destaque / denúncia). */
  const separatorAfterOwner = ownerExtras && (pinRow || showReport);
  /** Separa destaque legado ou perfil da denúncia. */
  const separatorBeforeReport = showReport && (ownerExtras || pinRow);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            type="button"
            data-post-ignore-open={stopTriggerPropagation ? "true" : undefined}
            className={cn("touch-manipulation", triggerClassName)}
            aria-label="Menu da publicação"
            onClick={stopTriggerPropagation ? (e) => e.stopPropagation() : undefined}
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-[11rem] border-[var(--woody-accent)]/20 bg-[var(--woody-card)]"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {showEdit ? (
            <DropdownMenuItem
              className="text-[var(--woody-text)] focus:bg-[var(--woody-nav)]/10"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="mr-2 size-4" />
              Editar
            </DropdownMenuItem>
          ) : null}
          {showDelete ? (
            <DropdownMenuItem
              variant="destructive"
              className="focus:bg-[var(--woody-accent)]/10"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="mr-2 size-4" />
              Excluir
            </DropdownMenuItem>
          ) : null}
          {separatorAfterOwner ? (
            <DropdownMenuSeparator className="bg-[var(--woody-accent)]/15" />
          ) : null}
          {showProfilePin ? (
            <DropdownMenuItem
              className="text-[var(--woody-text)] focus:bg-[var(--woody-nav)]/10"
              disabled={profilePinMenu!.busy}
              onPointerDown={() => profilePinMenu!.onBeforeProfilePinPointerDown?.()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void profilePinMenu!.onToggle();
              }}
            >
              {profilePinMenu!.isPinned ? (
                <PinOff className="mr-2 size-4" />
              ) : (
                <Pin className="mr-2 size-4" />
              )}
              {profilePinMenu!.isPinned ? "Remover destaque do perfil" : "Destacar no perfil"}
            </DropdownMenuItem>
          ) : legacyPin ? (
            <DropdownMenuItem
              className="text-[var(--woody-text)] focus:bg-[var(--woody-nav)]/10"
              onClick={() => onPin!(post.id)}
            >
              <Pin className="mr-2 size-4" />
              Fixar
            </DropdownMenuItem>
          ) : null}
          {separatorBeforeReport ? (
            <DropdownMenuSeparator className="bg-[var(--woody-accent)]/15" />
          ) : null}
          {showReport ? (
            <DropdownMenuItem
              className="text-[var(--woody-muted)] focus:bg-[var(--woody-nav)]/10 focus:text-[var(--woody-text)]"
              onClick={() => setReportOpen(true)}
            >
              <Flag className="mr-2 size-4 opacity-80" />
              Denunciar
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {showEdit ? (
        <EditPostDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          post={post}
          viewerId={viewerId}
          onSaved={(next) => {
            onPostUpdated?.(next);
          }}
        />
      ) : null}

      {showDelete ? (
        <DeletePostConfirmationDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          postTitlePreview={post.title || post.content}
          isDeleting={isDeleting}
          errorMessage={deleteError}
          onConfirm={handleDelete}
        />
      ) : null}

      {reportOpen ? (
        <ReportContentModal
          open={reportOpen}
          onOpenChange={setReportOpen}
          viewerId={viewerId}
          target={{ kind: "post", post }}
        />
      ) : null}
    </>
  );
}
