import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Comment } from "@/domain/types";
import { formatCommentTimestamp } from "./formatCommentTimestamp";

export interface CommentItemProps {
  comment: Comment;
  className?: string;
}

export function CommentItem({ comment, className }: CommentItemProps) {
  const { author } = comment;
  const initials = author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className={cn("flex gap-3 py-4 first:pt-0 last:pb-0", className)}>
      <Link
        to={`/profile/${author.id}`}
        className="mt-0.5 shrink-0 rounded-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--woody-card)]"
        aria-label={`Ver perfil de ${author.name}`}
      >
        <Avatar size="sm" className="size-9 sm:size-10 ring-0">
          <AvatarImage src={author.avatarUrl ?? undefined} alt="" className="block" />
          <AvatarFallback className="bg-[var(--woody-nav)]/10 text-[0.65rem] font-medium text-[var(--woody-text)]">
            {initials}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <Link
            to={`/profile/${author.id}`}
            className="truncate text-sm font-semibold text-[var(--woody-text)] hover:underline underline-offset-2"
          >
            {author.name}
          </Link>
          <span className="truncate text-xs text-[var(--woody-muted)]">@{author.username}</span>
          <span className="text-xs text-[var(--woody-muted)] tabular-nums" title={comment.createdAt}>
            {formatCommentTimestamp(comment.createdAt)}
          </span>
        </header>
        <p className="mt-1.5 whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-[var(--woody-text)]/90 [overflow-wrap:anywhere]">
          {comment.body}
        </p>
      </div>
    </article>
  );
}
