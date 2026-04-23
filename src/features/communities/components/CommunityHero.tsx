import { Link } from "react-router-dom";
import { BarChart3, ChevronDown, ChevronLeft, Globe, LayoutDashboard, Lock, Settings2, UserCog, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { woodyFocus, woodySurface } from "@/lib/woody-ui";
import type { CommunityMembershipStatusResult } from "@/domain/permissions";
import type { Community, JoinRequest } from "@/domain/types";
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
  /** Owner/admin: resumo, upgrade e ajuda (gating no diálogo). */
  showGrowthEntry?: boolean;
  onOpenGrowth?: () => void;
  /** Staff + espaço premium: painel completo de analytics. */
  adminDashboardHref?: string;
  className?: string;
}

function formatMemberCount(n: number): string {
  if (n >= 10000) return `${Math.round(n / 1000)} mil membros`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")} mil membros`;
  return `${n} ${n === 1 ? "membro" : "membros"}`;
}

const shell = cn(
  woodySurface.cardHero,
  "relative overflow-hidden shadow-[0_8px_28px_rgba(10,10,10,0.08)]"
);

const styles = {
  banner: "relative h-32 w-full overflow-hidden sm:h-40 md:h-44",
  bannerImg: "size-full object-cover",
  bannerFallback:
    "size-full bg-gradient-to-br from-[var(--woody-nav)]/35 via-[var(--woody-accent)]/22 to-[var(--woody-bg)]",
  tint: "pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--woody-card)] via-[var(--woody-card)]/45 to-transparent",
  backRow:
    "absolute left-0 right-0 top-0 z-20 flex items-center gap-2 px-3 pt-3 sm:px-5 sm:pt-4 md:px-7",
  backLink: cn(
    woodyFocus.ring,
    "inline-flex items-center gap-1 rounded-lg bg-[var(--woody-card)]/92 px-2.5 py-1.5 text-xs font-semibold text-[var(--woody-text)]",
    "shadow-sm ring-1 ring-[var(--woody-accent)]/12 backdrop-blur-sm transition-colors hover:bg-[var(--woody-card)] sm:text-sm"
  ),
  body: "relative z-10 -mt-9 w-full min-w-0 px-4 pb-7 sm:-mt-10 sm:px-6 sm:pb-8 md:px-8 md:pb-9",
  stack: "flex w-full min-w-0 flex-col gap-5 md:gap-6",
  identityRow:
    "flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:gap-5 md:gap-6",
  avatar:
    "size-[4.5rem] shrink-0 rounded-2xl border-[3px] border-[var(--woody-card)] object-cover shadow-md sm:size-24 md:size-[5.25rem]",
  avatarFallback: cn(
    "flex size-[4.5rem] shrink-0 items-center justify-center rounded-2xl border-[3px] border-[var(--woody-card)]",
    "bg-[var(--woody-nav)]/12 text-base font-bold text-[var(--woody-text)] shadow-md sm:size-24 md:size-[5.25rem] md:text-lg"
  ),
  /** Bloco do título ocupa toda a largura restante; nunca parteilha linha com botões. */
  titleColumn: "w-full min-w-0 flex-1",
  title:
    "w-full break-words text-xl font-bold leading-tight tracking-tight text-[var(--woody-text)] sm:text-2xl md:text-3xl",
  meta: "mt-2 flex flex-wrap items-center gap-x-2 gap-y-2 text-xs text-[var(--woody-muted)] sm:text-sm",
  metaSep: "hidden text-[var(--woody-accent)]/35 sm:inline",
  metaChip: cn(
    "inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--woody-nav)]/12 px-2.5 py-0.5 text-xs font-semibold text-[var(--woody-text)]",
    "ring-1 ring-[var(--woody-accent)]/10"
  ),
  /** Descrição em bloco próprio, largura total — sem line-clamp no hero. */
  description:
    "w-full min-w-0 break-words text-sm leading-relaxed text-[var(--woody-text)]/88 sm:text-[0.9375rem]",
  actionsRow:
    "flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3",
  ctaJoin: cn(
    "h-11 min-h-11 w-full rounded-xl px-5 font-semibold shadow-sm sm:w-auto sm:min-w-[12.5rem]",
    "bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/92"
  ),
  ctaLeave: cn(
    "h-11 min-h-11 w-full rounded-xl border border-[var(--woody-accent)]/30 px-5 font-semibold sm:w-auto sm:min-w-[12.5rem]",
    "bg-[var(--woody-card)] text-[var(--woody-text)] hover:bg-[var(--woody-nav)]/8"
  ),
  ctaMuted: cn(
    "h-11 min-h-11 w-full cursor-not-allowed rounded-xl border border-[var(--woody-accent)]/20 px-5 font-semibold opacity-90 sm:w-auto sm:min-w-[12.5rem]",
    "bg-[var(--woody-card)]/90 text-[var(--woody-muted)]"
  ),
  adminTrigger: cn(
    "h-11 min-h-11 w-full justify-center gap-1.5 rounded-xl border border-[var(--woody-accent)]/22 bg-[var(--woody-bg)] px-4 sm:w-auto",
    "text-sm font-medium text-[var(--woody-text)] hover:bg-[var(--woody-nav)]/6"
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
  showGrowthEntry = false,
  onOpenGrowth,
  adminDashboardHref,
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
    cta.variant === "leave" ? styles.ctaLeave : cta.variant === "muted" ? styles.ctaMuted : styles.ctaJoin;

  const showAdminMenu =
    (canManage && onManageCommunity) ||
    (canManageMembers && onManageMembers) ||
    (showGrowthEntry && onOpenGrowth) ||
    Boolean(adminDashboardHref);
  const description = community.description.trim();

  return (
    <header className={cn(shell, className)}>
      <div className={styles.banner}>
        {community.coverUrl ? (
          <img src={community.coverUrl} alt="" className={styles.bannerImg} loading="eager" />
        ) : (
          <div className={styles.bannerFallback} aria-hidden />
        )}
        <div className={styles.tint} aria-hidden />
      </div>

      <div className={styles.backRow}>
        <Link to="/communities" className={styles.backLink}>
          <ChevronLeft className="size-4 shrink-0 opacity-80" aria-hidden />
          Comunidades
        </Link>
      </div>

      <div className={styles.body}>
        <div className={styles.stack}>
          <div className={styles.identityRow}>
            {community.avatarUrl ? (
              <img src={community.avatarUrl} alt="" className={styles.avatar} loading="eager" />
            ) : (
              <span className={styles.avatarFallback} aria-hidden>
                {initials}
              </span>
            )}
            <div className={styles.titleColumn}>
              <h1 className={styles.title}>{community.name}</h1>
              <div className={styles.meta}>
                <span className={styles.metaChip}>{categoryLabel}</span>
                <span className={styles.metaSep} aria-hidden>
                  ·
                </span>
                <span className="inline-flex max-w-full items-center gap-1.5 break-words">
                  <Users className="size-3.5 shrink-0 opacity-80 sm:size-4" aria-hidden />
                  {formatMemberCount(memberCount)}
                </span>
                <span className={styles.metaSep} aria-hidden>
                  ·
                </span>
                {community.visibility === "private" ? (
                  <span className="inline-flex items-center gap-1 font-medium text-[var(--woody-text)]/90">
                    <Lock className="size-3.5 shrink-0 opacity-80" aria-hidden />
                    Privada
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-medium text-[var(--woody-text)]/90">
                    <Globe className="size-3.5 shrink-0 opacity-80" aria-hidden />
                    Pública
                  </span>
                )}
              </div>
            </div>
          </div>

          {description ? (
            <p className={styles.description}>{description}</p>
          ) : (
            <p className={cn(styles.description, "italic text-[var(--woody-muted)]")}>
              Sem descrição neste espaço. Detalhes adicionais podem aparecer na coluna ao lado quando
              existirem.
            </p>
          )}

          <div className={styles.actionsRow}>
            <Button
              type="button"
              variant={cta.variant === "muted" ? "secondary" : cta.variant === "leave" ? "outline" : "default"}
              size="lg"
              disabled={cta.disabled || ctaBusy}
              onClick={() => void cta.onClick()}
              className={cn(woodyFocus.ring, ctaClass)}
            >
              {ctaBusy ? "Aguarde…" : cta.label}
            </Button>

            {showAdminMenu ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className={cn(woodyFocus.ring, styles.adminTrigger)}
                    aria-label="Administrar comunidade"
                  >
                    Administrar
                    <ChevronDown className="size-4 opacity-70" aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="min-w-[12rem] border-[var(--woody-accent)]/20 bg-[var(--woody-card)]"
                >
                  {canManage && onManageCommunity ? (
                    <DropdownMenuItem
                      onClick={() => onManageCommunity()}
                      className="cursor-pointer text-[var(--woody-text)] focus:bg-[var(--woody-nav)]/10"
                    >
                      <Settings2 className="size-4 opacity-80" aria-hidden />
                      Editar comunidade
                    </DropdownMenuItem>
                  ) : null}
                  {canManageMembers && onManageMembers ? (
                    <DropdownMenuItem
                      onClick={() => onManageMembers()}
                      className="cursor-pointer text-[var(--woody-text)] focus:bg-[var(--woody-nav)]/10"
                    >
                      <UserCog className="size-4 opacity-80" aria-hidden />
                      Moderar membros
                    </DropdownMenuItem>
                  ) : null}
                  {showGrowthEntry && onOpenGrowth ? (
                    <DropdownMenuItem
                      onClick={() => onOpenGrowth()}
                      className="cursor-pointer text-[var(--woody-text)] focus:bg-[var(--woody-nav)]/10"
                    >
                      <BarChart3 className="size-4 opacity-80" aria-hidden />
                      Resumo e upgrade do espaço
                    </DropdownMenuItem>
                  ) : null}
                  {adminDashboardHref ? (
                    <DropdownMenuItem asChild>
                      <Link
                        to={adminDashboardHref}
                        className="cursor-pointer text-[var(--woody-text)] focus:bg-[var(--woody-nav)]/10"
                      >
                        <LayoutDashboard className="size-4 opacity-80" aria-hidden />
                        Painel completo de analytics
                      </Link>
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>

          {accessNotice ? (
            <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
              {accessNotice}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
