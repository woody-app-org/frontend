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

const rowClassFeed = cn(
  "flex min-w-0 w-[calc(100%+3rem)] items-center gap-3 rounded-t-2xl -mt-5 mb-2.5 mx-[-1.5rem] border-b border-black/[0.06]",
  "bg-black/[0.03] px-4 py-3.5 sm:px-5 transition-[background-color] duration-200"
);

/** Na página da comunidade o contexto já é óbvio — faixa mais discreta, sem bleed negativo. */
const rowClassCommunity = cn(
  "mb-3 flex w-full min-w-0 items-center gap-2.5 rounded-xl border border-[var(--woody-accent)]/10",
  "bg-[var(--woody-nav)]/[0.04] px-3 py-2 sm:px-3.5"
);

const nameClass =
  "min-w-0 truncate text-left text-[0.9375rem] font-semibold leading-tight text-[var(--woody-text)] group-hover:text-[var(--woody-nav)] transition-colors";

const categoryClass = cn(
  "shrink-0 rounded-full px-2.5 py-[0.1875rem] text-[0.6875rem] font-semibold tracking-wide",
  "bg-[var(--woody-tag-bg)] text-[var(--woody-tag-text)] ring-1 ring-[rgba(139,195,74,0.32)]"
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
      <div className="flex min-w-0 flex-1 items-center gap-2">
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
      <div className={cn(rowClassCommunity, className)} aria-label={`Post em ${preview.name}`}>
        {inner}
      </div>
    );
  }

  return (
    <Link
      to={`/communities/${preview.slug}`}
      className={cn(
        rowClassFeed,
        "group hover:bg-[var(--woody-nav)]/10 active:bg-[var(--woody-nav)]/12",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/35 focus-visible:ring-inset",
        className
      )}
      aria-label={`Ir para a comunidade ${preview.name}`}
    >
      {inner}
    </Link>
  );
}
