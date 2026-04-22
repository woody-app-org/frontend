import { cn } from "@/lib/utils";
import type { Post } from "@/domain/types";
import type { CommentThreadNode } from "@/domain/lib/commentThreads";
import { COMMENT_THREAD_ACTION_INDENT, commentRepliesRegionId } from "./commentThreadLayout";
import { CommentItem } from "./CommentItem";
import { NestedRepliesList } from "./NestedRepliesList";
import { ReplyComposer } from "./ReplyComposer";
import { ReplyToggle } from "./ReplyToggle";

export interface CommentThreadItemProps {
  post: Post;
  viewerId: string;
  onCommentsReload?: () => Promise<void>;
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
  post,
  viewerId,
  onCommentsReload,
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

  const repliesRegionId = commentRepliesRegionId(comment.id);

  return (
    <div className={cn(depth > 0 && "min-w-0")}>
      <CommentItem
        post={post}
        comment={comment}
        viewerId={viewerId}
        onCommentsReload={onCommentsReload}
        nested={depth > 0}
        className="py-0"
      />
      <div className={cn("mt-1.5 space-y-2", COMMENT_THREAD_ACTION_INDENT)}>
        <div className="flex flex-wrap items-stretch gap-x-2 gap-y-2 sm:items-center sm:gap-x-3">
          {!isReplyOpen ? (
            <button
              type="button"
              disabled={isCreatingComment}
              onClick={() => onReplyingToChange(comment.id)}
              className={cn(
                "touch-manipulation inline-flex min-h-11 items-center rounded-lg px-2.5 text-sm font-medium sm:min-h-9 sm:px-2 sm:text-xs",
                "text-[var(--woody-accent)]",
                "transition-[color,opacity,transform,background-color] duration-200",
                "hover:bg-[var(--woody-nav)]/10 hover:underline hover:underline-offset-2",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/30",
                "disabled:pointer-events-none disabled:opacity-45",
                "active:scale-[0.99]"
              )}
            >
              Responder
            </button>
          ) : null}
          {hasReplies ? (
            <ReplyToggle
              replyCount={replyCount}
              expanded={expanded}
              ariaControls={expanded ? repliesRegionId : undefined}
              onToggle={() => onToggleExpand(comment.id)}
            />
          ) : null}
        </div>
        {isReplyOpen ? (
          <ReplyComposer
            parentCommentId={comment.id}
            parentAuthorName={comment.author.name}
            onSubmit={handleReplySubmit}
            onCancel={() => onReplyingToChange(null)}
            isSubmitting={isCreatingComment}
            disabled={isCreatingComment}
            omitActionIndent
          />
        ) : null}
      </div>
      {hasReplies && expanded ? (
        <NestedRepliesList depth={depth} regionId={repliesRegionId}>
          {replies.map((child) => (
            <CommentThreadItem
              key={child.comment.id}
              post={post}
              viewerId={viewerId}
              onCommentsReload={onCommentsReload}
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
