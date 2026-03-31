import { cn } from "@/lib/utils";
import type { CommentThreadNode } from "@/domain/lib/commentThreads";
import { CommentItem } from "./CommentItem";
import { NestedRepliesList } from "./NestedRepliesList";
import { ReplyToggle } from "./ReplyToggle";

export interface CommentThreadItemProps {
  node: CommentThreadNode;
  depth: number;
  expandedIds: ReadonlySet<string>;
  onToggleExpand: (commentId: string) => void;
}

/** Alinha o toggle com a coluna de texto (avatar 2.25rem + gap 0.75rem ≈ 3rem). */
const TOGGLE_INDENT = "ml-[2.85rem] sm:ml-[3.25rem]";

export function CommentThreadItem({ node, depth, expandedIds, onToggleExpand }: CommentThreadItemProps) {
  const { comment, replies } = node;
  const replyCount = replies.length;
  const hasReplies = replyCount > 0;
  const expanded = expandedIds.has(comment.id);

  return (
    <div className={cn(depth > 0 && "min-w-0")}>
      <CommentItem comment={comment} className="py-0" />
      {hasReplies ? (
        <div className={cn("mt-1", TOGGLE_INDENT)}>
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
            />
          ))}
        </NestedRepliesList>
      ) : null}
    </div>
  );
}
