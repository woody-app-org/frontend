import { useEffect, useState, useSyncExternalStore } from "react";
import { EyeOff, Flag, MoreVertical, Pin, PinOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Comment, Post } from "@/domain/types";
import {
  canDeleteOwnComment,
  canHideCommentOnOwnedPost,
  canPinCommentAsPostAuthor,
  canReportComment,
  canUnpinCommentAsPostAuthor,
} from "@/domain/contentModerationPermissions";
import {
  getContentReportsVersion,
  subscribeContentReports,
} from "@/domain/mocks/contentReportMockStore";
import {
  deleteCommentMock,
  hideCommentMock,
} from "@/domain/services/contentModerationMock.service";
import { pinCommentOnPost, unpinCommentOnPost } from "@/features/feed/services/postPin.service";
import {
  DeleteCommentConfirmationDialog,
  HideCommentConfirmationDialog,
} from "./CommentModerationDialogs";
import { ReportContentModal } from "../report/ReportContentModal";

export interface CommentActionsMenuProps {
  post: Post;
  comment: Comment;
  viewerId: string;
  /** Após destacar/remover destaque, sincroniza com a API. */
  onCommentsReload?: () => Promise<void>;
  /** Mensagens breves (erros de rede/API) junto ao comentário. */
  onActionMessage?: (message: string | null) => void;
}

export function CommentActionsMenu({
  post,
  comment,
  viewerId,
  onCommentsReload,
  onActionMessage,
}: CommentActionsMenuProps) {
  const reportRev = useSyncExternalStore(
    subscribeContentReports,
    getContentReportsVersion,
    getContentReportsVersion
  );
  void reportRev;

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [hideOpen, setHideOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [hideBusy, setHideBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [hideError, setHideError] = useState<string | null>(null);
  const [pinBusy, setPinBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const showDelete = canDeleteOwnComment(viewerId, post, comment);
  const showHide = canHideCommentOnOwnedPost(viewerId, post, comment);
  const showReport = canReportComment(viewerId, post, comment);
  const showPin = Boolean(onCommentsReload) && canPinCommentAsPostAuthor(viewerId, post, comment);
  const showUnpin = Boolean(onCommentsReload) && canUnpinCommentAsPostAuthor(viewerId, post, comment);
  const hasDropdownTrigger = showDelete || showHide || showReport || showPin || showUnpin;

  useEffect(() => {
    if (deleteOpen) setDeleteError(null);
  }, [deleteOpen]);

  useEffect(() => {
    if (hideOpen) setHideError(null);
  }, [hideOpen]);

  useEffect(() => {
    if (menuOpen) onActionMessage?.(null);
  }, [menuOpen, onActionMessage]);

  if (!hasDropdownTrigger && !deleteOpen && !hideOpen && !reportOpen) {
    return null;
  }

  const runDelete = async () => {
    setDeleteError(null);
    setDeleteBusy(true);
    try {
      const result = await deleteCommentMock(comment.id, viewerId);
      if (!result.ok) {
        setDeleteError(result.message);
        return;
      }
      setDeleteOpen(false);
    } finally {
      setDeleteBusy(false);
    }
  };

  const runHide = async () => {
    setHideError(null);
    setHideBusy(true);
    try {
      const result = await hideCommentMock(comment.id, viewerId, post.id);
      if (!result.ok) {
        setHideError(result.message);
        return;
      }
      setHideOpen(false);
    } finally {
      setHideBusy(false);
    }
  };

  const runPinToggle = async () => {
    if (!onCommentsReload) return;
    setMenuOpen(false);
    setPinBusy(true);
    onActionMessage?.(null);
    try {
      if (comment.pinnedOnPostAt) {
        await unpinCommentOnPost(post.id, comment.id);
      } else {
        await pinCommentOnPost(post.id, comment.id);
      }
      await onCommentsReload();
    } catch (e) {
      onActionMessage?.(e instanceof Error ? e.message : "Não foi possível atualizar o destaque.");
    } finally {
      setPinBusy(false);
    }
  };

  const moderationBlock = showDelete || showHide;
  const pinBlock = showPin || showUnpin;

  return (
    <>
      {hasDropdownTrigger ? (
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="touch-manipulation shrink-0 text-[var(--woody-muted)] hover:bg-[var(--woody-nav)]/10 hover:text-[var(--woody-text)] min-h-11 min-w-11 sm:min-h-8 sm:min-w-8"
              aria-label="Ações do comentário"
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-[10.5rem] border-[var(--woody-accent)]/20 bg-[var(--woody-card)]"
          >
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
            {showHide ? (
              <DropdownMenuItem
                className="text-[var(--woody-text)] focus:bg-[var(--woody-nav)]/10"
                onClick={() => setHideOpen(true)}
              >
                <EyeOff className="mr-2 size-4" />
                Ocultar para outras
              </DropdownMenuItem>
            ) : null}
            {moderationBlock && pinBlock ? (
              <DropdownMenuSeparator className="bg-[var(--woody-accent)]/15" />
            ) : null}
            {showUnpin ? (
              <DropdownMenuItem
                className="text-[var(--woody-text)] focus:bg-[var(--woody-nav)]/10"
                disabled={pinBusy}
                onClick={() => void runPinToggle()}
              >
                <PinOff className="mr-2 size-4" />
                Remover destaque
              </DropdownMenuItem>
            ) : showPin ? (
              <DropdownMenuItem
                className="text-[var(--woody-text)] focus:bg-[var(--woody-nav)]/10"
                disabled={pinBusy}
                onClick={() => void runPinToggle()}
              >
                <Pin className="mr-2 size-4" />
                Destacar no topo
              </DropdownMenuItem>
            ) : null}
            {(moderationBlock || pinBlock) && showReport ? (
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
      ) : null}

      {showDelete ? (
        <DeleteCommentConfirmationDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          isBusy={deleteBusy}
          errorMessage={deleteError}
          onConfirm={runDelete}
        />
      ) : null}

      {showHide ? (
        <HideCommentConfirmationDialog
          open={hideOpen}
          onOpenChange={setHideOpen}
          isBusy={hideBusy}
          errorMessage={hideError}
          onConfirm={runHide}
        />
      ) : null}

      {reportOpen ? (
        <ReportContentModal
          open={reportOpen}
          onOpenChange={setReportOpen}
          viewerId={viewerId}
          target={{ kind: "comment", post, comment }}
        />
      ) : null}
    </>
  );
}
