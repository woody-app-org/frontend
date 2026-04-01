import { cn } from "@/lib/utils";
import type { CommentThreadNode } from "@/domain/lib/commentThreads";
import { COMMENT_THREAD_ACTION_INDENT } from "./commentThreadLayout";
import { CommentItem } from "./CommentItem";
import { NestedRepliesList } from "./NestedRepliesList";
import { ReplyComposer } from "./ReplyComposer";
import { ReplyToggle } from "./ReplyToggle";

export interface CommentThreadItemProps {
  node: CommentThreadNode;
  depth: number;
  expandedIds: ReadonlySet<string>;
  onToggleExpand: (commentId: string) => void;
  replyingToCommentId: string | null;
  onReplyingToChange: (commentId: string | null) => void;
  onReplySubmit: (body: string, parentCommentId: string) => Promise<boolean>;
  isCreatingComment: boolean;
  ensureRepliesExpanded: (commentId: string) => void;
}

export function CommentThreadItem({
  node,
  depth,
  expandedIds,
  onToggleExpand,
  replyingToCommentId,
  onReplyingToChange,
  onReplySubmit,
  isCreatingComment,
  ensureRepliesExpanded,
}: CommentThreadItemProps) {
  const { comment, replies } = node;
  const replyCount = replies.length;
  const hasReplies = replyCount > 0;
  const expanded = expandedIds.has(comment.id);
  const isReplyOpen = replyingToCommentId === comment.id;

  const handleReplySubmit = async (body: string) => {
    const ok = await onReplySubmit(body, comment.id);
    if (ok) {
      ensureRepliesExpanded(comment.id);
      onReplyingToChange(null);
    }
    return ok;
  };

  return (
    <div className={cn(depth > 0 && "min-w-0")}>
      <CommentItem comment={comment} className="py-0" />
      <div className={cn("mt-1", COMMENT_THREAD_ACTION_INDENT)}>
        {isReplyOpen ? (
          <ReplyComposer
            parentCommentId={comment.id}
            parentAuthorName={comment.author.name}
            onSubmit={handleReplySubmit}
            onCancel={() => onReplyingToChange(null)}
            isSubmitting={isCreatingComment}
            disabled={isCreatingComment}
          />
        ) : (
          <button
            type="button"
            disabled={isCreatingComment}
            onClick={() => onReplyingToChange(comment.id)}
            className={cn(
              "rounded-md text-xs font-medium text-[var(--woody-accent)]",
              "transition-[color,opacity,transform] duration-200",
              "hover:underline hover:underline-offset-2",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/30",
              "disabled:pointer-events-none disabled:opacity-45",
              "active:scale-[0.99]"
            )}
          >
            Responder
          </button>
        )}
      </div>
      {hasReplies ? (
        <div className={cn("mt-1", COMMENT_THREAD_ACTION_INDENT)}>
          <ReplyToggle
            replyCount={replyCount}
            expanded={expanded}
            onToggle={() => onToggleExpand(comment.id)}
          />
        </div>
      ) : null}
      {hasReplies && expanded ? (
        <NestedRepliesList depth={depth}>
          {replies.map((child) => (
            <CommentThreadItem
              key={child.comment.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              replyingToCommentId={replyingToCommentId}
              onReplyingToChange={onReplyingToChange}
              onReplySubmit={onReplySubmit}
              isCreatingComment={isCreatingComment}
              ensureRepliesExpanded={ensureRepliesExpanded}
            />
          ))}
        </NestedRepliesList>
      ) : null}
    </div>
  );
}
