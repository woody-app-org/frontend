import { useCallback, useMemo, useState } from "react";
import type { Comment, Post } from "@/domain/types";
import { buildCommentThreadTree } from "@/domain/lib/commentThreads";
import { cn } from "@/lib/utils";
import { useViewerId } from "@/features/auth/hooks/useViewerId";
import { CommentThreadItem } from "./CommentThreadItem";

export interface CommentThreadProps {
  post: Post;
  postId: string;
  comments: Comment[];
  onCommentsReload?: () => Promise<void>;
  replyingToCommentId: string | null;
  onReplyingToChange: (commentId: string | null) => void;
  /** Resposta a comentário (`parentCommentId` sempre definido). */
  onReplySubmit: (body: string, parentCommentId: string) => Promise<boolean>;
  isCreatingComment: boolean;
  className?: string;
}

export function CommentThread({
  post,
  postId,
  comments,
  onCommentsReload,
  replyingToCommentId,
  onReplyingToChange,
  onReplySubmit,
  isCreatingComment,
  className,
}: CommentThreadProps) {
  const viewerId = useViewerId();
  const tree = useMemo(() => buildCommentThreadTree(postId, comments), [postId, comments]);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  const onToggleExpand = useCallback((commentId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  }, []);

  const ensureRepliesExpanded = useCallback((commentId: string) => {
    setExpandedIds((prev) => {
      if (prev.has(commentId)) return prev;
      const next = new Set(prev);
      next.add(commentId);
      return next;
    });
  }, []);

  if (!tree.length) return null;

  return (
    <div className={cn("divide-y divide-[var(--woody-accent)]/8", className)}>
      {tree.map((node) => (
        <div key={node.comment.id} className="py-4 first:pt-0 last:pb-0 sm:py-5">
          <CommentThreadItem
            post={post}
            viewerId={viewerId}
            onCommentsReload={onCommentsReload}
            node={node}
            depth={0}
            expandedIds={expandedIds}
            onToggleExpand={onToggleExpand}
            replyingToCommentId={replyingToCommentId}
            onReplyingToChange={onReplyingToChange}
            onReplySubmit={onReplySubmit}
            isCreatingComment={isCreatingComment}
            ensureRepliesExpanded={ensureRepliesExpanded}
          />
        </div>
      ))}
    </div>
  );
}
