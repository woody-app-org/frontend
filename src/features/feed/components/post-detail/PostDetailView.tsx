import { useEffect, useRef } from "react";
import type { Comment, Post } from "@/domain/types";
import { Card } from "@/components/ui/card";
import { CommentComposer } from "./CommentComposer";
import { CommentsList } from "./CommentsList";
import { PostDetailActions } from "./PostDetailActions";
import { PostDetailContent } from "./PostDetailContent";
import { PostDetailHeader } from "./PostDetailHeader";

export interface PostDetailViewProps {
  post: Post;
  comments: Comment[];
  isCommentsLoading: boolean;
  commentsError: string | null;
  focusCommentsOnOpen?: boolean;
  isMutatingLike: boolean;
  isCreatingComment: boolean;
  onToggleLike: () => void;
  onCreateComment: (body: string) => Promise<boolean>;
}

export function PostDetailView({
  post,
  comments,
  isCommentsLoading,
  commentsError,
  focusCommentsOnOpen = false,
  isMutatingLike,
  isCreatingComment,
  onToggleLike,
  onCreateComment,
}: PostDetailViewProps) {
  const commentsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!focusCommentsOnOpen) return;
    if (isCommentsLoading) return;
    const id = window.setTimeout(() => {
      commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 30);
    return () => window.clearTimeout(id);
  }, [focusCommentsOnOpen, isCommentsLoading]);

  return (
    <Card className="border-[var(--woody-accent)]/15 bg-[var(--woody-card)] px-4 py-4 sm:px-6 sm:py-5">
      <div className="space-y-5">
        <PostDetailHeader post={post} />
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

          <CommentsList comments={comments} isLoading={isCommentsLoading} error={commentsError} />

          <CommentComposer
            onCreateComment={onCreateComment}
            isSubmitting={isCreatingComment}
            commentsReady={!isCommentsLoading}
            emphasizeEntry={focusCommentsOnOpen}
          />
        </section>
      </div>
    </Card>
  );
}
