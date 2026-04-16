import { Link } from "react-router-dom";
import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const rowClassFeed = cn(
  "flex w-full min-w-0 items-center gap-2.5 rounded-t-2xl -mx-4 -mt-3 mb-1 border-b border-[var(--woody-accent)]/12",
  "bg-[var(--woody-nav)]/[0.06] px-3 py-2 sm:px-4 text-sm"
);

const rowClassCommunity = cn(
  "mb-3 flex w-full min-w-0 items-center gap-2.5 rounded-xl border border-[var(--woody-accent)]/10",
  "bg-[var(--woody-nav)]/[0.04] px-3 py-2 sm:px-3.5 text-sm"
);

export interface PostProfileContextBarProps {
  authorId: string;
  authorDisplayName: string;
  variant: "feed" | "community";
  className?: string;
}

/**
 * Faixa de contexto para posts de perfil (paralelo visual a {@link PostCommunityContextBar}).
 */
export function PostProfileContextBar({
  authorId,
  authorDisplayName,
  variant,
  className,
}: PostProfileContextBarProps) {
  return (
    <div className={cn(variant === "feed" ? rowClassFeed : rowClassCommunity, className)}>
      <UserRound className="size-4 shrink-0 text-[var(--woody-nav)]" aria-hidden />
      <span className="min-w-0 text-[var(--woody-muted)]">
        <span className="font-semibold text-[var(--woody-text)]">Publicação no perfil</span>
        <span className="text-[var(--woody-muted)]"> · </span>
        <Link
          to={`/profile/${authorId}`}
          data-post-ignore-open="true"
          className="font-medium text-[var(--woody-nav)] underline-offset-2 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {authorDisplayName}
        </Link>
      </span>
    </div>
  );
}
