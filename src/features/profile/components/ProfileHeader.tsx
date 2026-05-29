import { useMemo, useState, type ReactNode } from "react";
import {
  AtSign,
  BookOpen,
  BriefcaseBusiness,
  Heart,
  Luggage,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  ShieldBan,
  Sparkles,
  UserX,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StoryRing } from "@/components/ui/StoryRing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import type { UserProfile } from "../types";
import { ProBadge } from "@/features/subscription/components/ProBadge";
import { resolvePublicMediaUrl } from "@/lib/api";
import { ProfileBadgesSection } from "./ProfileBadgesSection";

const styles = {
  card:
    "overflow-hidden rounded-[1.35rem] border border-[var(--woody-divider)] bg-[var(--woody-card)] shadow-[0_10px_34px_rgba(10,10,10,0.08),0_1px_3px_rgba(10,10,10,0.05)]",
  bannerWrap: "w-full overflow-hidden rounded-t-[1.35rem] bg-[var(--woody-nav)]/10",
  banner: "h-44 min-h-44 w-full object-cover sm:h-52 md:h-[15rem]",
  content: "px-5 pb-6 pt-0 sm:px-7 sm:pb-7",
  topRow: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
  avatarWrap: "-mt-12 shrink-0 sm:-mt-16",
  avatar:
    "size-24 rounded-full border-[5px] border-[var(--woody-card)] shadow-[0_8px_24px_rgba(10,10,10,0.16)] ring-1 ring-black/[0.04] sm:size-28",
  infoRow:
    "mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start",
  actionsCol: "flex w-full flex-wrap items-center gap-2 sm:w-auto sm:shrink-0 sm:justify-end",
  meta: "min-w-0 flex-1",
  nameBlock: "min-w-0",
  name: "font-heading truncate text-2xl font-semibold tracking-[-0.02em] text-[var(--woody-text)] sm:text-[1.7rem]",
  pronouns: "text-sm font-medium text-[var(--woody-muted)]",
  details: "mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-[var(--woody-muted)]",
  detailItem: "inline-flex min-w-0 max-w-full items-center gap-1",
  /** Caixa fixa centra ícones Lucide com o texto (evita desalinhamento óptico). */
  detailIconWrap:
    "flex size-4 shrink-0 items-center justify-center text-[var(--woody-muted)]/85 [&>svg]:size-3.5 [&>svg]:shrink-0",
  detailText: "min-w-0 truncate leading-snug",
  tags: "mt-4 flex flex-wrap gap-2",
  tag:
    "inline-flex items-center gap-1.5 rounded-full border border-[var(--woody-accent)]/18 bg-[var(--woody-tag-bg)] px-3 py-1 text-xs font-semibold leading-none text-[var(--woody-tag-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]",
  editBtn:
    "rounded-xl border border-[var(--woody-accent)]/22 bg-[var(--woody-card)] text-[var(--woody-text)] shadow-[0_1px_2px_rgba(10,10,10,0.04)] hover:bg-[var(--woody-nav)]/8 text-sm font-semibold shrink-0 transition-transform active:scale-[0.98]",
  menuBtn:
    "size-10 rounded-xl border border-[var(--woody-accent)]/14 bg-[var(--woody-card)] p-0 text-[var(--woody-text)] shadow-[0_1px_2px_rgba(10,10,10,0.04)] hover:bg-[var(--woody-nav)]/8",
  bio: "mt-5 max-w-3xl whitespace-pre-wrap break-words text-[0.95rem] leading-7 text-[var(--woody-text)]/92",
};

function InterestIcon({ label }: { label: string }) {
  const normalized = label.toLocaleLowerCase("pt-PT");
  const Icon = normalized.includes("leitur") || normalized.includes("livro")
    ? BookOpen
    : normalized.includes("viagem") || normalized.includes("travel")
      ? Luggage
      : normalized.includes("bem") || normalized.includes("saúde") || normalized.includes("saude")
        ? Heart
        : Sparkles;

  return <Icon className="size-3.5 shrink-0" aria-hidden />;
}

export interface ProfileHeaderProps {
  profile: UserProfile;
  className?: string;
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
  /** Botão de seguir (montado pelo pai quando há sessão e não é o próprio perfil). */
  followSlot?: ReactNode;
  /** Contadores seguidores / a seguir (clicáveis). */
  followStats?: ReactNode;
  /** Abrir visualizador de stories (quando `profile.hasActiveStories`). */
  onViewStories?: () => void;
  /** Abrir compositor de story (próprio perfil). */
  onAddStory?: () => void;
  /** Lista de usuárias bloqueadas (próprio perfil). */
  onOpenBlockedUsers?: () => void;
  /** Iniciar fluxo de bloqueio (perfil alheio autenticado). */
  onBlockUser?: () => void;
}

export function ProfileHeader({
  profile,
  className,
  isOwnProfile = false,
  onEditProfile,
  followSlot,
  followStats,
  onViewStories,
  onAddStory,
  onOpenBlockedUsers,
  onBlockUser,
}: ProfileHeaderProps) {
  const resolvedBannerUrl = useMemo(
    () => (profile.bannerUrl ? resolvePublicMediaUrl(profile.bannerUrl) : ""),
    [profile.bannerUrl]
  );

  const bannerKey = profile.bannerUrl ?? "";
  const [failedBannerKey, setFailedBannerKey] = useState<string | null>(null);
  const bannerLoadFailed = Boolean(bannerKey) && failedBannerKey === bannerKey;

  const showBannerImage =
    Boolean(profile.bannerUrl && resolvedBannerUrl && !bannerLoadFailed);

  return (
    <Card className={cn(styles.card, className)}>
      <div className={styles.bannerWrap}>
        {showBannerImage ? (
          <img
            src={resolvedBannerUrl}
            alt=""
            className={styles.banner}
            onError={() => {
              if (import.meta.env.DEV) {
                console.warn("[Woody] Profile banner failed to load", resolvedBannerUrl);
              }
              setFailedBannerKey(bannerKey);
            }}
          />
        ) : profile.bannerUrl ? (
          <div
            className={cn(
              styles.banner,
              "bg-gradient-to-br from-[var(--woody-nav)]/25 via-[var(--woody-accent)]/12 to-[var(--woody-nav)]/20"
            )}
            aria-hidden
          />
        ) : (
          <div className={cn(styles.banner, "bg-[var(--woody-nav)]/15")} />
        )}
      </div>
      <CardContent className={styles.content}>
        <div className={styles.topRow}>
          <div className={styles.avatarWrap}>
            <div className="relative inline-flex">
              <StoryRing
                avatarUrl={profile.avatarUrl}
                displayName={profile.name}
                hasActiveStories={profile.hasActiveStories ?? false}
                size="lg"
                avatarClassName={styles.avatar}
                onClick={
                  profile.hasActiveStories && onViewStories
                    ? (event) => {
                        event.preventDefault();
                        onViewStories();
                      }
                    : undefined
                }
              />
              {isOwnProfile && onAddStory ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onAddStory();
                  }}
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 flex size-9 items-center justify-center rounded-full",
                    "border-[3px] border-[var(--woody-card)] bg-[var(--woody-nav)] text-white shadow-[0_4px_12px_rgba(10,10,10,0.2)]",
                    "transition-transform hover:scale-105 active:scale-95",
                    woodyFocus.ring
                  )}
                  aria-label="Adicionar story"
                >
                  <Plus className="size-4 stroke-[2.5]" aria-hidden />
                </button>
              ) : null}
            </div>
          </div>
          {isOwnProfile && onEditProfile ? (
            <div className={cn(styles.actionsCol, "pt-4 sm:pt-5")}>
              {onAddStory ? (
                <Button
                  type="button"
                  className={cn(
                    styles.editBtn,
                    woodyFocus.ring,
                    "touch-manipulation min-h-10 border-[var(--woody-nav)]/28 bg-[var(--woody-nav)]/10"
                  )}
                  variant="outline"
                  size="sm"
                  onClick={onAddStory}
                >
                  <Plus className="size-4 text-[var(--woody-nav)]" aria-hidden />
                  Adicionar story
                </Button>
              ) : null}
              <Button
                type="button"
                className={cn(styles.editBtn, woodyFocus.ring, "touch-manipulation min-h-10")}
                variant="outline"
                size="sm"
                onClick={onEditProfile}
              >
                <Pencil className="size-4 text-[var(--woody-nav)]" />
                Editar perfil
              </Button>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={cn(styles.menuBtn, woodyFocus.ring)}
                    aria-label="Mais ações do perfil"
                  >
                    <MoreHorizontal className="size-4" aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[11rem] border-[var(--woody-accent)]/20 bg-[var(--woody-card)]">
                  <DropdownMenuItem onSelect={onEditProfile} className="cursor-pointer">
                    <Pencil className="size-4 text-[var(--woody-nav)]" aria-hidden />
                    Editar perfil
                  </DropdownMenuItem>
                  {onOpenBlockedUsers ? (
                    <DropdownMenuItem onSelect={onOpenBlockedUsers} className="cursor-pointer">
                      <UserX className="size-4 text-[var(--woody-nav)]" aria-hidden />
                      Usuárias bloqueadas
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : !isOwnProfile && (followSlot || onBlockUser) ? (
            <div className={cn(styles.actionsCol, "pt-4 sm:pt-5")}>
              <div className="flex w-full items-start gap-2 sm:justify-end">
                {followSlot ? <div className="min-w-0 flex-1">{followSlot}</div> : null}
                {onBlockUser ? (
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className={cn(styles.menuBtn, woodyFocus.ring, "shrink-0 touch-manipulation")}
                        aria-label="Mais ações do perfil"
                      >
                        <MoreHorizontal className="size-4" aria-hidden />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="min-w-[12rem] border-[var(--woody-accent)]/20 bg-[var(--woody-card)]"
                    >
                      <DropdownMenuItem
                        onSelect={onBlockUser}
                        className="cursor-pointer text-red-700 focus:text-red-700"
                      >
                        <ShieldBan className="size-4" aria-hidden />
                        Bloquear usuária
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
        <div className={styles.infoRow}>
          <div className={styles.meta}>
            <div className={styles.nameBlock}>
              <div className="flex flex-wrap items-baseline gap-1.5">
                <h1 className={styles.name}>{profile.name}</h1>
                {profile.showProBadge ? <ProBadge variant="profile" /> : null}
                {profile.pronouns && (
                  <>
                    <span className={styles.pronouns}>•</span>
                    <span className={styles.pronouns}>{profile.pronouns}</span>
                  </>
                )}
              </div>
              <div className={styles.details} aria-label="Informações do perfil">
                {profile.profession ? (
                  <span className={styles.detailItem}>
                    <span className={styles.detailIconWrap} aria-hidden>
                      <BriefcaseBusiness />
                    </span>
                    <span className={styles.detailText}>{profile.profession}</span>
                  </span>
                ) : null}
                {profile.location ? (
                  <span className={styles.detailItem}>
                    <span className={styles.detailIconWrap} aria-hidden>
                      <MapPin />
                    </span>
                    <span className={styles.detailText}>{profile.location}</span>
                  </span>
                ) : null}
                {profile.username ? (
                  <span
                    className={styles.detailItem}
                    aria-label={`Nome de utilizador @${profile.username}`}
                  >
                    <span className={styles.detailIconWrap} aria-hidden>
                      <AtSign />
                    </span>
                    <span className={styles.detailText}>{profile.username}</span>
                  </span>
                ) : null}
              </div>
              {followStats ? <div className="mt-4">{followStats}</div> : null}
              {profile.interests.length > 0 && (
                <div className={styles.tags}>
                  {profile.interests.slice(0, 5).map((tag) => (
                    <span key={tag.id} className={styles.tag}>
                      <InterestIcon label={tag.label} />
                      {tag.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
        <ProfileBadgesSection badges={profile.badges} />
      </CardContent>
    </Card>
  );
}
