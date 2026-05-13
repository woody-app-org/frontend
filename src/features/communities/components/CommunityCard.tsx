import { Link } from "react-router-dom";
import { ArrowRight, Lock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { woodyFocus, woodyMotion, woodySurface } from "@/lib/woody-ui";
import type { Community } from "@/domain/types";
import { CommunityTag } from "./CommunityTag";
import { getCommunityCategoryLabel } from "../lib/communitiesPageModel";

export interface CommunityCardProps {
  community: Community;
  /** Se a usuária já participa (texto do CTA). */
  isMember?: boolean;
  /**
   * Quando a lista já conhece o estado do pedido (evita N+1 na grelha geral).
   * Se omitido, o CTA de comunidade privada assume navegação neutra (“Ver espaço”).
   */
  myJoinStatus?: "none" | "pending" | "rejected" | "cancelled" | "approved";
  /** Cards mais altos e avatares maiores (ex.: grids de descoberta no desktop). */
  visualWeight?: "default" | "emphasis";
  className?: string;
}

function formatMemberCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")} mil membros`;
  return `${n} ${n === 1 ? "membro" : "membros"}`;
}

const styles = {
  link: cn(
    woodySurface.card,
    woodyMotion.cardHover,
    woodyFocus.ring,
    "group flex h-full flex-col overflow-hidden"
  ),
  coverWrap: "relative h-24 shrink-0 overflow-hidden sm:h-28",
  coverWrapEmphasis:
    "relative h-28 shrink-0 overflow-hidden sm:h-32 md:h-40 lg:h-[10.5rem]",
  coverImg: "size-full object-cover transition duration-300 group-hover:scale-[1.03]",
  coverFallback: "size-full bg-gradient-to-br from-[var(--woody-nav)]/25 to-[var(--woody-accent)]/20",
  coverGradient:
    "pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--woody-card)]/90 via-transparent to-transparent",
  privateBadge: cn(
    "absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
    "bg-[var(--woody-card)]/92 text-[var(--woody-text)]/90 shadow-sm ring-1 ring-[var(--woody-accent)]/15 backdrop-blur-sm sm:text-[11px]"
  ),
  avatarWrap: "relative -mt-9 ml-4 flex items-end sm:-mt-10 sm:ml-5",
  avatarWrapEmphasis:
    "relative -mt-11 ml-4 flex items-end sm:-mt-12 sm:ml-5 md:-mt-14 md:ml-6",
  avatar: "size-14 shrink-0 rounded-2xl border-[3px] border-[var(--woody-card)] object-cover shadow-md sm:size-16",
  avatarEmphasis:
    "size-16 shrink-0 rounded-2xl border-[3px] border-[var(--woody-card)] object-cover shadow-md sm:size-[4.25rem] md:size-20 md:border-[4px]",
  avatarFallback: cn(
    "flex size-14 shrink-0 items-center justify-center rounded-2xl border-[3px] border-[var(--woody-card)]",
    "bg-[var(--woody-nav)]/15 text-sm font-bold text-[var(--woody-text)] sm:size-16"
  ),
  avatarFallbackEmphasis: cn(
    "flex size-16 shrink-0 items-center justify-center rounded-2xl border-[3px] border-[var(--woody-card)]",
    "bg-[var(--woody-nav)]/15 text-sm font-bold text-[var(--woody-text)] sm:size-[4.25rem] md:size-20 md:border-[4px]"
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
  ctaRow: "mt-4 flex flex-col gap-1 border-t border-[var(--woody-accent)]/12 pt-4",
  cta: cn(
    "inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold sm:w-auto sm:justify-start",
    "bg-[var(--woody-nav)] text-white transition-colors",
    "group-hover:bg-[var(--woody-nav)]/92"
  ),
  joinHint: "text-center text-[11px] font-medium text-[var(--woody-muted)] sm:text-left",
} as const;

function resolveCtaLabel(
  community: Community,
  isMember: boolean,
  myJoinStatus: CommunityCardProps["myJoinStatus"]
): string {
  if (isMember) return "Ver comunidade";
  if (community.visibility === "private") {
    if (myJoinStatus === "pending") return "Ver estado do pedido";
    if (myJoinStatus === "rejected" || myJoinStatus === "cancelled") return "Ver espaço";
    if (myJoinStatus === "approved") return "Abrir comunidade";
    return "Ver espaço";
  }
  return "Participar";
}

function resolveJoinHint(
  community: Community,
  isMember: boolean,
  myJoinStatus: CommunityCardProps["myJoinStatus"]
): string | null {
  if (isMember || community.visibility !== "private") return null;
  if (myJoinStatus === "pending") return "Solicitação enviada";
  if (myJoinStatus === "rejected") return "Podes solicitar novamente no espaço";
  if (myJoinStatus === "cancelled") return "Pedido cancelado — podes voltar a pedir";
  return null;
}

export function CommunityCard({
  community,
  isMember = false,
  myJoinStatus,
  visualWeight = "default",
  className,
}: CommunityCardProps) {
  const to = `/communities/${community.slug}`;
  const categoryLabel = getCommunityCategoryLabel(community.category);
  const emphasis = visualWeight === "emphasis";
  const initials = community.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const visibleTags = community.tags.slice(0, 3);
  const moreTags = community.tags.length - visibleTags.length;
  const isPrivate = community.visibility === "private";
  const ctaLabel = resolveCtaLabel(community, isMember, myJoinStatus);
  const joinHint = resolveJoinHint(community, isMember, myJoinStatus);

  return (
    <Link to={to} className={cn(styles.link, "h-full", className)}>
      <div className={emphasis ? styles.coverWrapEmphasis : styles.coverWrap}>
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
        {isPrivate ? (
          <span className={styles.privateBadge}>
            <Lock className="size-3 opacity-80" aria-hidden />
            Privada
          </span>
        ) : null}
      </div>

      <div className={emphasis ? styles.avatarWrapEmphasis : styles.avatarWrap}>
        {community.avatarUrl ? (
          <img
            src={community.avatarUrl}
            alt=""
            className={emphasis ? styles.avatarEmphasis : styles.avatar}
            loading="lazy"
          />
        ) : (
          <span className={emphasis ? styles.avatarFallbackEmphasis : styles.avatarFallback} aria-hidden>
            {initials}
          </span>
        )}
      </div>

      <div className={cn(styles.body, emphasis && "sm:px-6 sm:pb-6 md:pt-2")}>
        <h3 className={cn(styles.title, emphasis && "md:text-lg")}>{community.name}</h3>
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
            {ctaLabel}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
          {joinHint ? <span className={styles.joinHint}>{joinHint}</span> : null}
        </div>
      </div>
    </Link>
  );
}
