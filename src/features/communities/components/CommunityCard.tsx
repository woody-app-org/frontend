import { Link } from "react-router-dom";
import { ArrowRight, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Community } from "@/domain/types";
import { CommunityTag } from "./CommunityTag";
import { getCommunityCategoryLabel } from "../lib/communitiesPageModel";

export interface CommunityCardProps {
  community: Community;
  /** Se a usuária já participa (texto do CTA). */
  isMember?: boolean;
  className?: string;
}

function formatMemberCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")} mil membros`;
  return `${n} ${n === 1 ? "membro" : "membros"}`;
}

const styles = {
  link: cn(
    "group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--woody-accent)]/20",
    "bg-[var(--woody-card)] shadow-[0_1px_3px_rgba(92,58,59,0.06)] transition-all duration-200",
    "hover:border-[var(--woody-accent)]/35 hover:shadow-[0_8px_24px_rgba(92,58,59,0.1)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--woody-bg)]"
  ),
  coverWrap: "relative h-24 shrink-0 overflow-hidden sm:h-28",
  coverImg: "size-full object-cover transition duration-300 group-hover:scale-[1.03]",
  coverFallback: "size-full bg-gradient-to-br from-[var(--woody-nav)]/25 to-[var(--woody-accent)]/20",
  coverGradient:
    "pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--woody-card)]/90 via-transparent to-transparent",
  avatarWrap: "relative -mt-9 ml-4 flex items-end sm:-mt-10 sm:ml-5",
  avatar: "size-14 shrink-0 rounded-2xl border-[3px] border-[var(--woody-card)] object-cover shadow-md sm:size-16",
  avatarFallback: cn(
    "flex size-14 shrink-0 items-center justify-center rounded-2xl border-[3px] border-[var(--woody-card)]",
    "bg-[var(--woody-nav)]/15 text-sm font-bold text-[var(--woody-text)] sm:size-16"
  ),
  body: "flex min-h-0 flex-1 flex-col px-4 pb-4 pt-1 sm:px-5 sm:pb-5",
  title: "line-clamp-2 text-base font-bold leading-snug text-[var(--woody-text)] sm:text-[1.05rem]",
  desc: "mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--woody-text)]/80",
  metaRow: "mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--woody-muted)]",
  categoryPill: cn(
    "rounded-full bg-[var(--woody-nav)]/14 px-2.5 py-0.5 font-semibold text-[var(--woody-text)]",
    "ring-1 ring-[var(--woody-accent)]/12"
  ),
  members: "inline-flex items-center gap-1",
  tagsRow: "mt-3 flex flex-wrap gap-1.5",
  ctaRow: "mt-4 flex border-t border-[var(--woody-accent)]/12 pt-4",
  cta: cn(
    "inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold sm:w-auto sm:justify-start",
    "bg-[var(--woody-nav)] text-white transition-colors",
    "group-hover:bg-[var(--woody-nav)]/92"
  ),
} as const;

export function CommunityCard({ community, isMember = false, className }: CommunityCardProps) {
  const to = `/communities/${community.slug}`;
  const categoryLabel = getCommunityCategoryLabel(community.category);
  const initials = community.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const visibleTags = community.tags.slice(0, 3);
  const moreTags = community.tags.length - visibleTags.length;

  return (
    <Link to={to} className={cn(styles.link, "h-full", className)}>
      <div className={styles.coverWrap}>
        {community.coverUrl ? (
          <img
            src={community.coverUrl}
            alt=""
            className={styles.coverImg}
            loading="lazy"
          />
        ) : (
          <div className={styles.coverFallback} aria-hidden />
        )}
        <div className={styles.coverGradient} aria-hidden />
      </div>

      <div className={styles.avatarWrap}>
        {community.avatarUrl ? (
          <img src={community.avatarUrl} alt="" className={styles.avatar} loading="lazy" />
        ) : (
          <span className={styles.avatarFallback} aria-hidden>
            {initials}
          </span>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{community.name}</h3>
        <p className={styles.desc}>{community.description}</p>

        <div className={styles.metaRow}>
          <span className={styles.categoryPill}>{categoryLabel}</span>
          <span className={styles.members}>
            <Users className="size-3.5 shrink-0 opacity-80" aria-hidden />
            {formatMemberCount(community.memberCount)}
          </span>
        </div>

        {visibleTags.length > 0 ? (
          <div className={styles.tagsRow}>
            {visibleTags.map((tag) => (
              <CommunityTag key={tag} label={tag} />
            ))}
            {moreTags > 0 ? <CommunityTag label={`+${moreTags}`} /> : null}
          </div>
        ) : null}

        <div className={styles.ctaRow}>
          <span className={styles.cta}>
            {isMember ? "Ver comunidade" : "Participar"}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
