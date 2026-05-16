import { useState } from "react";
import { Link } from "react-router-dom";
import { Pin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Comment, Post } from "@/domain/types";
import { getCommentContentForViewer, isCommentContentMaskedForViewer } from "@/domain/lib/contentModerationDisplay";
import { formatCommentTimestamp } from "./formatCommentTimestamp";
import { CommentActionsMenu } from "./CommentActionsMenu";
import { HiddenCommentPlaceholder } from "./HiddenCommentPlaceholder";
import { ProBadge } from "@/features/subscription/components/ProBadge";
import { PostLikeIcon } from "@/features/feed/components/PostLikeIcon";
import { usePostLikeTapAnimation } from "@/features/feed/hooks/usePostLikeTapAnimation";
import { useAuth } from "@/features/auth/context/AuthContext";

function formatLikeCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

export interface CommentItemProps {
  post: Post;
  comment: Comment;
  viewerId: string;
  /** Recarrega comentários após ações da autora do post (ex.: destaque). */
  onCommentsReload?: () => Promise<void>;
  /** Resposta na thread: tipografia e densidade levemente mais compactas (mobile-first). */
  nested?: boolean;
  className?: string;
  onToggleCommentLike: (commentId: string) => void;
  isCommentLikePending?: boolean;
}

export function CommentItem({
  post,
  comment,
  viewerId,
  onCommentsReload,
  nested = false,
  className,
  onToggleCommentLike,
  isCommentLikePending = false,
}: CommentItemProps) {
  const { author } = comment;
  const { isAuthenticated } = useAuth();
  const { tapPhase, triggerTap } = usePostLikeTapAnimation();
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const initials = author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article
      id={`comment-${comment.id}`}
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
        <div className="flex gap-2 sm:gap-2.5">
          <header className="flex min-w-0 flex-1 flex-wrap content-start items-start gap-x-2 gap-y-1 sm:items-baseline">
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
                className="inline-flex shrink-0 items-center rounded-md bg-[var(--woody-accent)]/8 p-0.5 text-[var(--woody-accent)]/85"
                title="Comentário fixado no topo"
                aria-label="Comentário fixado no topo"
              >
                <Pin
                  className={cn("stroke-[1.75]", nested ? "size-3 sm:size-3.5" : "size-3.5 sm:size-4")}
                  aria-hidden
                />
              </span>
            ) : null}
          </header>
          <div className="shrink-0 self-start pt-0.5 sm:pt-0">
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
          <div className="mt-1.5 space-y-2">
            {getCommentContentForViewer(comment).trim() ? (
              <p
                className={cn(
                  "whitespace-pre-wrap leading-relaxed text-[var(--woody-text)]/90 [overflow-wrap:anywhere]",
                  nested ? "text-[0.875rem] sm:text-[0.9375rem]" : "text-[0.9375rem]"
                )}
              >
                {getCommentContentForViewer(comment)}
              </p>
            ) : null}
            {comment.gifUrl ? (
              <div className="max-w-[min(100%,240px)]">
                <img
                  src={comment.gifThumbnailUrl || comment.gifUrl}
                  alt={comment.gifTitle ? `GIF: ${comment.gifTitle}` : "GIF do comentário"}
                  className="max-h-[200px] w-full rounded-lg border border-[var(--woody-accent)]/10 object-contain sm:max-h-[220px]"
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              </div>
            ) : null}
          </div>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <button
            type="button"
            disabled={isCommentLikePending}
            onClick={() => {
              const willBecomeLiked = !comment.likedByCurrentUser;
              triggerTap(willBecomeLiked);
              onToggleCommentLike(comment.id);
            }}
            title={!isAuthenticated ? "Inicia sessão para curtir" : undefined}
            aria-pressed={comment.likedByCurrentUser}
            aria-label={
              comment.likedByCurrentUser ? "Remover curtida do comentário" : "Curtir comentário"
            }
            className={cn(
              "touch-manipulation inline-flex min-h-9 items-center gap-1 rounded-lg px-1.5 py-1 text-xs font-medium sm:min-h-8",
              "text-[var(--woody-muted)] transition-[color,opacity,transform,background-color] duration-200",
              comment.likedByCurrentUser && "text-[var(--woody-accent)]",
              "hover:bg-[var(--woody-nav)]/10 hover:text-[var(--woody-text)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/30",
              "disabled:pointer-events-none disabled:opacity-50",
              "active:scale-[0.98]"
            )}
          >
            <PostLikeIcon
              liked={comment.likedByCurrentUser}
              tapPhase={tapPhase}
              sizeClassName={nested ? "size-3.5 sm:size-4" : "size-4"}
            />
            <span className="tabular-nums text-[var(--woody-muted)]">{formatLikeCount(comment.likesCount)}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
