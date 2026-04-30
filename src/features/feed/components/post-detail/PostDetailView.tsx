import { useEffect, useRef, useState } from "react";
import type { Comment, Post } from "@/domain/types";
import { Card } from "@/components/ui/card";
import { CommentComposer } from "./CommentComposer";
import { CommentsList } from "./CommentsList";
import { PostDetailActions } from "./PostDetailActions";
import { PostDetailContent } from "./PostDetailContent";
import { PostDetailHeader } from "./PostDetailHeader";

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
  /** Comentário raiz (`parentCommentId` null). Respostas usam `onReplySubmit` na lista. */
  onCreateComment: (body: string) => Promise<boolean>;
  onReplySubmit: (body: string, parentCommentId: string) => Promise<boolean>;
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
  onCreateComment,
  onReplySubmit,
  onReloadComments,
}: PostDetailViewProps) {
  const commentsRef = useRef<HTMLElement>(null);
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);

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

  return (
    <Card className="border-[var(--woody-accent)]/15 bg-[var(--woody-card)] px-4 py-4 sm:px-6 sm:py-5">
      <div className="space-y-5">
        <PostDetailHeader
          post={post}
          postDeleteRedirectTo={postDeleteRedirectTo}
          onPostUpdated={onPostUpdated}
        />
        <PostDetailContent post={post} />
        <PostDetailActions
          post={post}
          isMutatingLike={isMutatingLike}
          onLike={onToggleLike}
          onComment={() => commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        />

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

          <CommentComposer
            onCreateComment={onCreateComment}
            isSubmitting={isCreatingComment}
            commentsReady={!isCommentsLoading}
            emphasizeEntry={focusCommentsOnOpen}
            onInteractRoot={() => setReplyingToCommentId(null)}
          />

          <CommentsList
            post={post}
            postId={post.id}
            comments={comments}
            onCommentsReload={onReloadComments}
            isLoading={isCommentsLoading}
            error={commentsError}
            className="mt-1 border-t border-[var(--woody-accent)]/10 pt-5"
            replyingToCommentId={replyingToCommentId}
            onReplyingToChange={setReplyingToCommentId}
            onReplySubmit={onReplySubmit}
            isCreatingComment={isCreatingComment}
          />
        </section>
      </div>
    </Card>
  );
}
