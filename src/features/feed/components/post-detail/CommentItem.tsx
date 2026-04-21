import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Comment, Post } from "@/domain/types";
import { isCommentContentMaskedForViewer } from "@/domain/lib/contentModerationDisplay";
import { formatCommentTimestamp } from "./formatCommentTimestamp";
import { CommentActionsMenu } from "./CommentActionsMenu";
import { HiddenCommentPlaceholder } from "./HiddenCommentPlaceholder";
import { ProBadge } from "@/features/subscription/components/ProBadge";

export interface CommentItemProps {
  post: Post;
  comment: Comment;
  viewerId: string;
  /** Recarrega comentários após ações da autora do post (ex.: destaque). */
  onCommentsReload?: () => Promise<void>;
  /** Resposta na thread: tipografia e densidade levemente mais compactas (mobile-first). */
  nested?: boolean;
  className?: string;
}

export function CommentItem({
  post,
  comment,
  viewerId,
  onCommentsReload,
  nested = false,
  className,
}: CommentItemProps) {
  const { author } = comment;
  const [actionMessage, setActionMessage] = useState<string | null>(null);
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
        comment.pinnedOnPostAt &&
          "rounded-xl border border-[var(--woody-accent)]/12 bg-[var(--woody-accent)]/[0.04] px-2 py-2.5 sm:px-3",
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
            <span className="inline-flex min-w-0 max-w-full items-center gap-1">
              <Link
                to={`/profile/${author.id}`}
                className={cn(
                  "min-w-0 truncate font-semibold text-[var(--woody-text)] hover:underline underline-offset-2",
                  nested ? "text-[0.8125rem] sm:text-sm" : "text-sm"
                )}
              >
                {author.name}
              </Link>
              {author.showProBadge ? <ProBadge variant="inline" /> : null}
            </span>
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
            {comment.pinnedOnPostAt ? (
              <span
                className={cn(
                  "inline-flex items-center rounded-full border border-[var(--woody-accent)]/18 bg-[var(--woody-accent)]/8 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--woody-accent)]/95",
                  nested ? "text-[0.6rem]" : ""
                )}
              >
                Em destaque
              </span>
            ) : null}
          </header>
          <div className="shrink-0 self-start pt-0.5">
            <CommentActionsMenu
              post={post}
              comment={comment}
              viewerId={viewerId}
              onCommentsReload={onCommentsReload}
              onActionMessage={setActionMessage}
            />
          </div>
        </div>
        {actionMessage ? (
          <p
            role="alert"
            className="mt-1.5 text-xs text-amber-800 dark:text-amber-200/95 [overflow-wrap:anywhere]"
          >
            {actionMessage}
          </p>
        ) : null}
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
