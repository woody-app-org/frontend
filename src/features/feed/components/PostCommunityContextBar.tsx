import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { PostCommunityPreview } from "@/domain/types";
import { getCommunityCategoryLabel } from "@/domain/categoryLabels";

export interface PostCommunityContextBarProps {
  preview: PostCommunityPreview;
  variant: "feed" | "community";
  className?: string;
}

const rowClass = cn(
  "flex w-full min-w-0 items-center gap-2.5 rounded-t-2xl -mx-4 -mt-3 mb-1 border-b border-[var(--woody-accent)]/12",
  "bg-[var(--woody-nav)]/[0.06] px-3 py-2.5 sm:px-4"
);

const nameClass =
  "min-w-0 flex-1 text-left text-sm font-semibold leading-tight text-[var(--woody-text)] truncate group-hover:text-[var(--woody-nav)] transition-colors";

const categoryClass = cn(
  "shrink-0 rounded-full bg-[var(--woody-card)] px-2 py-0.5 text-[0.6875rem] font-semibold",
  "text-[var(--woody-text)] ring-1 ring-[var(--woody-accent)]/15"
);

function CommunityAvatar({ preview }: { preview: PostCommunityPreview }) {
  const initials = preview.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Avatar className="size-8 shrink-0 rounded-xl border border-[var(--woody-accent)]/15">
      {preview.avatarUrl ? (
        <AvatarImage src={preview.avatarUrl} alt="" className="object-cover" />
      ) : null}
      <AvatarFallback className="rounded-xl bg-[var(--woody-nav)]/12 text-[0.65rem] font-bold text-[var(--woody-text)]">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export function PostCommunityContextBar({ preview, variant, className }: PostCommunityContextBarProps) {
  const categoryLabel = getCommunityCategoryLabel(preview.category);

  const inner = (
    <>
      <CommunityAvatar preview={preview} />
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <span className={nameClass}>{preview.name}</span>
        <span className={categoryClass}>{categoryLabel}</span>
      </div>
      {variant === "feed" ? (
        <ChevronRight className="size-4 shrink-0 text-[var(--woody-muted)] opacity-70 group-hover:opacity-100" aria-hidden />
      ) : null}
    </>
  );

  if (variant === "community") {
    return (
      <div className={cn(rowClass, className)} aria-label={`Post em ${preview.name}`}>
        {inner}
      </div>
    );
  }

  return (
    <Link
      to={`/communities/${preview.slug}`}
      className={cn(
        rowClass,
        "group transition-colors hover:bg-[var(--woody-nav)]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/30",
        className
      )}
      aria-label={`Ir para a comunidade ${preview.name}`}
    >
      {inner}
    </Link>
  );
}
