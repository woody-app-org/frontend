import { useCallback, useEffect, useRef, useState } from "react";
import type { Comment, CommentGifDraft, Post } from "@/domain/types";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { CommentsList } from "./CommentsList";
import { PostDetailActions } from "./PostDetailActions";
import { PostDetailContent } from "./PostDetailContent";
import { PostDetailHeader } from "./PostDetailHeader";
import { CommentComposerModal } from "./CommentComposerModal";
import type { CommentComposerModalContext } from "./CommentComposerModal";

export interface PostDetailViewProps {
  post: Post;
  /** Destino após a autora excluir o post no detalhe. */
  postDeleteRedirectTo?: string;
  onPostUpdated?: (post: Post) => void;
  comments: Comment[];
  isCommentsLoading: boolean;
  commentsError: string | null;
  focusCommentsOnOpen?: boolean;
  /** Comentário a realçar (ex.: hash `#comment-12` na URL). */
  scrollToCommentId?: string | null;
  isMutatingLike: boolean;
  isCreatingComment: boolean;
  onToggleLike: () => void;
  onToggleCommentLike: (commentId: string) => void;
  commentLikePendingIds: ReadonlySet<string>;
  /** Comentário raiz (`parentCommentId` null). Respostas usam `onReplySubmit` na lista. */
  onCreateComment: (body: string, gif?: CommentGifDraft | null) => Promise<boolean>;
  onReplySubmit: (body: string, parentCommentId: string, gif?: CommentGifDraft | null) => Promise<boolean>;
  /** Atualiza comentários após ações da autora (ex.: destaque). */
  onReloadComments?: () => Promise<void>;
}

export function PostDetailView({
  post,
  postDeleteRedirectTo,
  onPostUpdated,
  comments,
  isCommentsLoading,
  commentsError,
  focusCommentsOnOpen = false,
  scrollToCommentId = null,
  isMutatingLike,
  isCreatingComment,
  onToggleLike,
  onToggleCommentLike,
  commentLikePendingIds,
  onCreateComment,
  onReplySubmit,
  onReloadComments,
}: PostDetailViewProps) {
  const commentsRef = useRef<HTMLElement>(null);
  const viewer = useCurrentUser();

  // Estado do modal compositor
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"comment" | "reply">("comment");
  const [modalParentId, setModalParentId] = useState<string | null>(null);
  const [modalContext, setModalContext] = useState<CommentComposerModalContext | undefined>(undefined);

  // Último commentId cujas replies precisam expandir após submit do modal
  const [forceExpandCommentId, setForceExpandCommentId] = useState<string | null>(null);

  const openCommentModal = useCallback(() => {
    setModalMode("comment");
    setModalParentId(null);
    setModalContext(undefined);
    setModalOpen(true);
  }, []);

  const openReplyModal = useCallback((commentId: string, context: CommentComposerModalContext) => {
    setModalMode("reply");
    setModalParentId(commentId);
    setModalContext(context);
    setModalOpen(true);
  }, []);

  const handleModalSubmit = useCallback(
    async (body: string, gif?: CommentGifDraft | null) => {
      if (modalMode === "reply" && modalParentId) {
        const ok = await onReplySubmit(body, modalParentId, gif);
        if (ok) setForceExpandCommentId(modalParentId);
        return ok;
      }
      return onCreateComment(body, gif);
    },
    [modalMode, modalParentId, onCreateComment, onReplySubmit]
  );

  useEffect(() => {
    if (!focusCommentsOnOpen) return;
    if (isCommentsLoading) return;
    const id = window.setTimeout(() => {
      commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 30);
    return () => window.clearTimeout(id);
  }, [focusCommentsOnOpen, isCommentsLoading]);

  useEffect(() => {
    if (!scrollToCommentId || isCommentsLoading) return;
    const id = window.setTimeout(() => {
      const el = document.getElementById(`comment-${scrollToCommentId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
    return () => window.clearTimeout(id);
  }, [scrollToCommentId, isCommentsLoading]);

  const viewerInitials = (viewer?.username ?? viewer?.name ?? "?").slice(0, 2).toUpperCase();

  return (
    <>
      <Card className="border-[var(--woody-accent)]/15 bg-[var(--woody-card)] px-4 py-4 sm:px-6 sm:py-5">
        <div className="space-y-5">
          <PostDetailHeader
            post={post}
            postDeleteRedirectTo={postDeleteRedirectTo}
            onPostUpdated={onPostUpdated}
          >
            <PostDetailContent post={post} />
            <PostDetailActions
              post={post}
              isMutatingLike={isMutatingLike}
              onLike={onToggleLike}
              onComment={() => {
                commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                openCommentModal();
              }}
            />
          </PostDetailHeader>

          <section
            ref={commentsRef}
            tabIndex={-1}
            aria-label="Comentários"
            className="space-y-5 border-t border-[var(--woody-accent)]/10 pt-6 outline-none"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base font-semibold text-[var(--woody-text)]">Comentários</h2>
              {!isCommentsLoading ? (
                <span className="text-xs text-[var(--woody-muted)] tabular-nums">{comments.length} respostas</span>
              ) : null}
            </div>

            {/* Trigger leve: avatar + placeholder */}
            <button
              type="button"
              onClick={openCommentModal}
              className="flex w-full items-center gap-3 rounded-xl border border-[var(--woody-accent)]/12 bg-[var(--woody-nav)]/[0.04] px-3 py-2.5 text-left transition-colors hover:bg-[var(--woody-nav)]/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/30"
              aria-label="Abrir compositor de comentário"
            >
              <Avatar size="default" className="size-8 shrink-0 ring-0">
                <AvatarImage src={viewer?.avatarUrl ?? undefined} alt={viewer?.username ?? ""} className="block" />
                <AvatarFallback className="bg-[var(--woody-nav)]/10 text-[var(--woody-text)] text-xs">
                  {viewerInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-[var(--woody-muted)]/75">Escreva um comentário...</span>
            </button>

            <CommentsList
              post={post}
              postId={post.id}
              comments={comments}
              onCommentsReload={onReloadComments}
              isLoading={isCommentsLoading}
              error={commentsError}
              className="mt-1 border-t border-[var(--woody-accent)]/10 pt-5"
              onOpenReplyModal={openReplyModal}
              isCreatingComment={isCreatingComment}
              onToggleCommentLike={onToggleCommentLike}
              commentLikePendingIds={commentLikePendingIds}
              forceExpandCommentId={forceExpandCommentId}
            />
          </section>
        </div>
      </Card>

      <CommentComposerModal
        open={modalOpen}
        mode={modalMode}
        isSubmitting={isCreatingComment}
        context={modalContext}
        onSubmit={handleModalSubmit}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
