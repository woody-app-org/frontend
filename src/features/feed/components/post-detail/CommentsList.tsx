import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Comment, Post } from "@/domain/types";
import { getRootCommentsByPostId } from "@/domain/lib/commentThreads";
import { CommentThread } from "./CommentThread";
import { CommentsEmptyState } from "./CommentsEmptyState";

function CommentsListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="divide-y divide-[var(--woody-accent)]/8" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3 py-4 first:pt-2">
          <Skeleton className="size-9 shrink-0 rounded-full bg-[var(--woody-nav)]/10 sm:size-10" />
          <div className="min-w-0 flex-1 space-y-2 pt-0.5">
            <Skeleton className="h-3.5 w-40 bg-[var(--woody-nav)]/10" />
            <Skeleton className="h-3 w-full max-w-md bg-[var(--woody-nav)]/10" />
            <Skeleton className="h-3 max-w-sm bg-[var(--woody-nav)]/10 w-[min(100%,18rem)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export interface CommentsListProps {
  post: Post;
  postId: string;
  comments: Comment[];
  onCommentsReload?: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  className?: string;
  replyingToCommentId: string | null;
  onReplyingToChange: (commentId: string | null) => void;
  onReplySubmit: (body: string, parentCommentId: string) => Promise<boolean>;
  isCreatingComment: boolean;
}

export function CommentsList({
  post,
  postId,
  comments,
  onCommentsReload,
  isLoading,
  error,
  className,
  replyingToCommentId,
  onReplyingToChange,
  onReplySubmit,
  isCreatingComment,
}: CommentsListProps) {
  if (error) {
    return (
      <div
        className={cn(
          "rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-3 text-sm text-amber-900 dark:text-amber-200",
          className
        )}
        role="alert"
      >
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn(className)}>
        <CommentsListSkeleton />
        <p className="sr-only">Carregando comentários</p>
      </div>
    );
  }

  const roots = getRootCommentsByPostId(postId, comments);

  if (!roots.length) {
    return <CommentsEmptyState className={className} />;
  }

  return (
    <CommentThread
      post={post}
      postId={postId}
      comments={comments}
      onCommentsReload={onCommentsReload}
      replyingToCommentId={replyingToCommentId}
      onReplyingToChange={onReplyingToChange}
      onReplySubmit={onReplySubmit}
      isCreatingComment={isCreatingComment}
      className={className}
    />
  );
}
