import { Link } from "react-router-dom";
import { ChevronLeft, Lock, Settings2, UserCog, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus, woodySurface } from "@/lib/woody-ui";
import type { CommunityMembershipStatusResult } from "@/domain/permissions";
import type { Community, JoinRequest } from "@/domain/types";
import { CommunityTag } from "./CommunityTag";
import { getCommunityCategoryLabel } from "../lib/communitiesPageModel";

export interface CommunityHeroProps {
  community: Community;
  viewerId: string;
  isMember: boolean;
  membershipStatus: CommunityMembershipStatusResult;
  joinRequest: JoinRequest | null;
  memberCount: number;
  onLeave: () => void | Promise<void>;
  onJoinPublic: () => void | Promise<void>;
  onRequestJoin: () => void | Promise<void>;
  ctaBusy?: boolean;
  accessNotice?: string | null;
  canManage?: boolean;
  onManageCommunity?: () => void;
  canManageMembers?: boolean;
  onManageMembers?: () => void;
  className?: string;
}

function formatMemberCount(n: number): string {
  if (n >= 10000) return `${Math.round(n / 1000)} mil membros`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")} mil membros`;
  return `${n} ${n === 1 ? "membro" : "membros"}`;
}

const styles = {
  wrap: cn(
    woodySurface.cardHero,
    "relative overflow-hidden shadow-[0_8px_28px_rgba(92,58,59,0.11)]"
  ),
  banner: "relative h-36 sm:h-44 md:h-52 w-full overflow-hidden",
  bannerImg: "size-full object-cover",
  bannerFallback:
    "size-full bg-gradient-to-br from-[var(--woody-nav)]/35 via-[var(--woody-accent)]/25 to-[var(--woody-bg)]",
  bannerTint:
    "pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--woody-card)] via-[var(--woody-card)]/40 to-transparent",
  backRow:
    "absolute left-0 right-0 top-0 z-20 flex items-center justify-between gap-2 px-3 pt-3 sm:px-4 sm:pt-4",
  backLink: cn(
    woodyFocus.ring,
    "inline-flex items-center gap-1 rounded-lg bg-[var(--woody-card)]/90 px-2.5 py-1.5 text-xs font-semibold text-[var(--woody-text)]",
    "shadow-sm ring-1 ring-[var(--woody-accent)]/15 backdrop-blur-sm transition-colors hover:bg-[var(--woody-card)] sm:text-sm"
  ),
  body: "relative z-10 -mt-10 pb-5 sm:-mt-12 sm:pb-6 md:-mt-14 md:pb-8",
  bodyInner: "flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8",
  identity: "flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-end sm:gap-5",
  avatar: "size-20 shrink-0 rounded-2xl border-4 border-[var(--woody-card)] object-cover shadow-lg sm:size-24 md:size-[5.5rem]",
  avatarFallback: cn(
    "flex size-20 shrink-0 items-center justify-center rounded-2xl border-4 border-[var(--woody-card)]",
    "bg-[var(--woody-nav)]/15 text-lg font-bold text-[var(--woody-text)] shadow-lg sm:size-24 md:size-[5.5rem] md:text-xl"
  ),
  textBlock: "min-w-0 pt-1 sm:pb-0.5",
  title: "text-2xl font-bold leading-tight tracking-tight text-[var(--woody-text)] sm:text-3xl",
  meta: "mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-[var(--woody-muted)]",
  category: cn(
    "rounded-full bg-[var(--woody-nav)]/14 px-3 py-0.5 text-xs font-semibold text-[var(--woody-text)]",
    "ring-1 ring-[var(--woody-accent)]/12"
  ),
  members: "inline-flex items-center gap-1.5",
  desc: "mt-3 max-w-3xl text-sm leading-relaxed text-[var(--woody-text)]/90 sm:text-[0.9375rem]",
  tags: "mt-3 flex flex-wrap gap-2",
  actions: "shrink-0 md:pb-1",
  ctaJoin: cn(
    "h-11 w-full min-w-[180px] rounded-xl px-6 font-semibold shadow-md sm:w-auto",
    "bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/92"
  ),
  ctaLeave: cn(
    "h-11 w-full min-w-[180px] rounded-xl border-[var(--woody-accent)]/35 px-6 font-semibold sm:w-auto",
    "bg-[var(--woody-card)] text-[var(--woody-text)] hover:bg-[var(--woody-nav)]/8"
  ),
  ctaManage: cn(
    "h-11 w-full min-w-[180px] rounded-xl border-[var(--woody-nav)]/35 px-6 font-semibold sm:w-auto",
    "bg-[var(--woody-card)] text-[var(--woody-text)] hover:bg-[var(--woody-nav)]/10"
  ),
  ctaMuted: cn(
    "h-11 w-full min-w-[180px] rounded-xl border-[var(--woody-accent)]/25 px-6 font-semibold sm:w-auto",
    "bg-[var(--woody-card)]/80 text-[var(--woody-muted)]"
  ),
} as const;

function resolvePrimaryCta(
  community: Community,
  isMember: boolean,
  membershipStatus: CommunityMembershipStatusResult,
  joinRequest: JoinRequest | null,
  onLeave: () => void | Promise<void>,
  onJoinPublic: () => void | Promise<void>,
  onRequestJoin: () => void | Promise<void>
): {
  label: string;
  onClick: () => void | Promise<void>;
  variant: "join" | "leave" | "muted";
  disabled: boolean;
} {
  if (isMember) {
    return { label: "Sair da comunidade", onClick: onLeave, variant: "leave", disabled: false };
  }
  if (membershipStatus === "banned") {
    return { label: "Acesso restrito", onClick: () => {}, variant: "muted", disabled: true };
  }
  if (community.visibility === "public") {
    return { label: "Participar", onClick: onJoinPublic, variant: "join", disabled: false };
  }

  const pendingJr = joinRequest?.status === "pending";
  const pendingMs = membershipStatus === "pending";
  if (pendingJr || pendingMs) {
    return { label: "Solicitação enviada", onClick: () => {}, variant: "muted", disabled: true };
  }
  if (joinRequest?.status === "rejected") {
    return { label: "Solicitar novamente", onClick: onRequestJoin, variant: "join", disabled: false };
  }
  return { label: "Solicitar entrada", onClick: onRequestJoin, variant: "join", disabled: false };
}

export function CommunityHero({
  community,
  viewerId: _viewerId,
  isMember,
  membershipStatus,
  joinRequest,
  memberCount,
  onLeave,
  onJoinPublic,
  onRequestJoin,
  ctaBusy = false,
  accessNotice,
  canManage = false,
  onManageCommunity,
  canManageMembers = false,
  onManageMembers,
  className,
}: CommunityHeroProps) {
  void _viewerId;
  const categoryLabel = getCommunityCategoryLabel(community.category);
  const initials = community.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const cta = resolvePrimaryCta(
    community,
    isMember,
    membershipStatus,
    joinRequest,
    onLeave,
    onJoinPublic,
    onRequestJoin
  );

  const ctaClass =
    cta.variant === "leave"
      ? styles.ctaLeave
      : cta.variant === "muted"
        ? styles.ctaMuted
        : styles.ctaJoin;

  return (
    <div className={cn(styles.wrap, className)}>
      <div className={styles.banner}>
        {community.coverUrl ? (
          <img src={community.coverUrl} alt="" className={styles.bannerImg} loading="eager" />
        ) : (
          <div className={styles.bannerFallback} aria-hidden />
        )}
        <div className={styles.bannerTint} aria-hidden />
      </div>

      <div className={styles.backRow}>
        <Link to="/communities" className={styles.backLink}>
          <ChevronLeft className="size-4 shrink-0 opacity-80" aria-hidden />
          Comunidades
        </Link>
      </div>

      <div className={cn(styles.body, "px-4 sm:px-6")}>
        <div className={styles.bodyInner}>
          <div className={styles.identity}>
            {community.avatarUrl ? (
              <img src={community.avatarUrl} alt="" className={styles.avatar} loading="eager" />
            ) : (
              <span className={styles.avatarFallback} aria-hidden>
                {initials}
              </span>
            )}
            <div className={styles.textBlock}>
              <h1 className={styles.title}>{community.name}</h1>
              <div className={styles.meta}>
                <span className={styles.category}>{categoryLabel}</span>
                {community.visibility === "private" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--woody-accent)]/8 px-2 py-0.5 text-[0.6875rem] font-semibold text-[var(--woody-text)] ring-1 ring-[var(--woody-accent)]/15">
                    <Lock className="size-3 opacity-85" aria-hidden />
                    Privada
                  </span>
                ) : null}
                <span className={styles.members}>
                  <Users className="size-4 shrink-0 opacity-85" aria-hidden />
                  {formatMemberCount(memberCount)}
                </span>
              </div>
              <p className={styles.desc}>{community.description}</p>
              {community.tags.length > 0 ? (
                <div className={styles.tags}>
                  {community.tags.map((tag) => (
                    <CommunityTag key={tag} label={tag} />
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className={styles.actions}>
            {canManage && onManageCommunity ? (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={onManageCommunity}
                className={cn(woodyFocus.ring, styles.ctaManage, "mb-2")}
              >
                <Settings2 className="size-5 shrink-0 opacity-90" aria-hidden />
                Gerenciar comunidade
              </Button>
            ) : null}
            {canManageMembers && onManageMembers ? (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={onManageMembers}
                className={cn(woodyFocus.ring, styles.ctaManage, "mb-2")}
              >
                <UserCog className="size-5 shrink-0 opacity-90" aria-hidden />
                Membros e acessos
              </Button>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              size="lg"
              disabled={cta.disabled || ctaBusy}
              onClick={() => void cta.onClick()}
              className={cn(woodyFocus.ring, ctaClass)}
            >
              {ctaBusy ? "Aguarde…" : cta.label}
            </Button>
            {accessNotice ? (
              <p className="mb-1 max-w-[260px] text-center text-xs font-medium text-red-600 dark:text-red-400 md:text-left">
                {accessNotice}
              </p>
            ) : null}
            {canManage ? (
              <p className="mb-1 max-w-[240px] text-center text-[0.6875rem] leading-snug text-[var(--woody-muted)] md:text-left">
                Configurações do espaço e moderadora ao lado.
              </p>
            ) : null}
            <p className="mt-0 max-w-[220px] text-center text-[0.6875rem] leading-snug text-[var(--woody-muted)] md:text-left">
              {community.visibility === "private" && !isMember && membershipStatus !== "banned"
                ? "Comunidade privada: sua entrada pode depender de aprovação."
                : null}
              {community.visibility === "private" && !isMember && membershipStatus !== "banned" ? " " : ""}
              {isMember
                ? "Você recebe atualizações e pode publicar neste espaço (mock)."
                : membershipStatus === "banned"
                  ? "Conta com restrição neste espaço (mock)."
                  : "Ao participar, você entra no círculo de conversas desta comunidade (mock)."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
