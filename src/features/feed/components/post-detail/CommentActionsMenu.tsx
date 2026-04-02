import { useEffect, useState, useSyncExternalStore } from "react";
import { EyeOff, Flag, MoreVertical, Trash2 } from "lucide-react";
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
  canReportComment,
} from "@/domain/contentModerationPermissions";
import {
  getContentReportsVersion,
  subscribeContentReports,
} from "@/domain/mocks/contentReportMockStore";
import {
  deleteCommentMock,
  hideCommentMock,
} from "@/domain/services/contentModerationMock.service";
import {
  DeleteCommentConfirmationDialog,
  HideCommentConfirmationDialog,
} from "./CommentModerationDialogs";
import { ReportContentModal } from "../report/ReportContentModal";

export interface CommentActionsMenuProps {
  post: Post;
  comment: Comment;
  viewerId: string;
}

export function CommentActionsMenu({ post, comment, viewerId }: CommentActionsMenuProps) {
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

  const showDelete = canDeleteOwnComment(viewerId, post, comment);
  const showHide = canHideCommentOnOwnedPost(viewerId, post, comment);
  const showReport = canReportComment(viewerId, post, comment);
  const hasDropdownTrigger = showDelete || showHide || showReport;

  useEffect(() => {
    if (deleteOpen) setDeleteError(null);
  }, [deleteOpen]);

  useEffect(() => {
    if (hideOpen) setHideError(null);
  }, [hideOpen]);

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
      const result = await hideCommentMock(comment.id, viewerId);
      if (!result.ok) {
        setHideError(result.message);
        return;
      }
      setHideOpen(false);
    } finally {
      setHideBusy(false);
    }
  };

  return (
    <>
      {hasDropdownTrigger ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="shrink-0 text-[var(--woody-muted)] hover:bg-[var(--woody-nav)]/10 hover:text-[var(--woody-text)] min-h-9 min-w-9 sm:min-h-8 sm:min-w-8"
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
            {(showDelete || showHide) && showReport ? (
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
