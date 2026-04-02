import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Comment, Post } from "@/domain/types";
import { isCommentContentMaskedForViewer } from "@/domain/lib/contentModerationDisplay";
import { formatCommentTimestamp } from "./formatCommentTimestamp";
import { CommentActionsMenu } from "./CommentActionsMenu";
import { HiddenCommentPlaceholder } from "./HiddenCommentPlaceholder";

export interface CommentItemProps {
  post: Post;
  comment: Comment;
  viewerId: string;
  /** Resposta na thread: tipografia e densidade levemente mais compactas (mobile-first). */
  nested?: boolean;
  className?: string;
}

export function CommentItem({ post, comment, viewerId, nested = false, className }: CommentItemProps) {
  const { author } = comment;
  const initials = author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article
      className={cn(
        "flex py-4 first:pt-0 last:pb-0",
        nested ? "gap-2.5 sm:gap-3" : "gap-3",
        className
      )}
    >
      <Link
        to={`/profile/${author.id}`}
        className="mt-0.5 shrink-0 rounded-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--woody-card)]"
        aria-label={`Ver perfil de ${author.name}`}
      >
        <Avatar
          size="sm"
          className={cn("ring-0", nested ? "size-8 sm:size-9" : "size-9 sm:size-10")}
        >
          <AvatarImage src={author.avatarUrl ?? undefined} alt="" className="block" />
          <AvatarFallback className="bg-[var(--woody-nav)]/10 text-[0.65rem] font-medium text-[var(--woody-text)]">
            {initials}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex gap-2">
          <header className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <Link
              to={`/profile/${author.id}`}
              className={cn(
                "truncate font-semibold text-[var(--woody-text)] hover:underline underline-offset-2",
                nested ? "text-[0.8125rem] sm:text-sm" : "text-sm"
              )}
            >
              {author.name}
            </Link>
            <span
              className={cn(
                "truncate text-[var(--woody-muted)]",
                nested ? "text-[0.6875rem] sm:text-xs" : "text-xs"
              )}
            >
              @{author.username}
            </span>
            <span
              className={cn(
                "tabular-nums text-[var(--woody-muted)]",
                nested ? "text-[0.6875rem] sm:text-xs" : "text-xs"
              )}
              title={comment.createdAt}
            >
              {formatCommentTimestamp(comment.createdAt)}
            </span>
          </header>
          <CommentActionsMenu post={post} comment={comment} viewerId={viewerId} />
        </div>
        {isCommentContentMaskedForViewer(comment) ? (
          <HiddenCommentPlaceholder nested={nested} />
        ) : (
          <p
            className={cn(
              "mt-1.5 whitespace-pre-wrap leading-relaxed text-[var(--woody-text)]/90 [overflow-wrap:anywhere]",
              nested ? "text-[0.875rem] sm:text-[0.9375rem]" : "text-[0.9375rem]"
            )}
          >
            {comment.content}
          </p>
        )}
      </div>
    </article>
  );
}
