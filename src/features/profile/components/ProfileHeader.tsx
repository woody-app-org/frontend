import { AtSign, BookOpen, BriefcaseBusiness, Heart, Luggage, MapPin, MoreHorizontal, Pencil, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import type { ReactNode } from "react";
import type { UserProfile } from "../types";
import { ProBadge } from "@/features/subscription/components/ProBadge";

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
  name: "truncate text-2xl font-bold tracking-[-0.03em] text-[var(--woody-text)] sm:text-[1.7rem]",
  pronouns: "text-sm font-medium text-[var(--woody-muted)]",
  details: "mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-[var(--woody-muted)]",
  detailItem: "inline-flex min-w-0 items-center gap-1.5",
  detailIcon: "size-3.5 shrink-0 text-[var(--woody-muted)]/85",
  tags: "mt-4 flex flex-wrap gap-2",
  tag:
    "inline-flex items-center gap-1.5 rounded-full border border-[var(--woody-accent)]/18 bg-[var(--woody-tag-bg)] px-3 py-1 text-xs font-semibold leading-none text-[var(--woody-tag-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]",
  editBtn:
    "rounded-xl border border-[var(--woody-accent)]/22 bg-[var(--woody-card)] text-[var(--woody-text)] shadow-[0_1px_2px_rgba(10,10,10,0.04)] hover:bg-[var(--woody-nav)]/8 text-sm font-semibold shrink-0 transition-transform active:scale-[0.98]",
  menuBtn:
    "size-10 rounded-xl border border-[var(--woody-accent)]/14 bg-[var(--woody-card)] p-0 text-[var(--woody-text)] shadow-[0_1px_2px_rgba(10,10,10,0.04)] hover:bg-[var(--woody-nav)]/8",
  bio: "mt-5 max-w-3xl whitespace-pre-wrap break-words text-[0.95rem] leading-7 text-[var(--woody-text)]/92",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

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
}

export function ProfileHeader({
  profile,
  className,
  isOwnProfile = false,
  onEditProfile,
  followSlot,
  followStats,
}: ProfileHeaderProps) {
  return (
    <Card className={cn(styles.card, className)}>
      <div className={styles.bannerWrap}>
        {profile.bannerUrl ? (
          <img
            src={profile.bannerUrl}
            alt=""
            className={styles.banner}
          />
        ) : (
          <div className={cn(styles.banner, "bg-[var(--woody-nav)]/15")} />
        )}
      </div>
      <CardContent className={styles.content}>
        <div className={styles.topRow}>
          <div className={styles.avatarWrap}>
            <Avatar className={styles.avatar}>
              <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.name} />
              <AvatarFallback className="bg-[var(--woody-nav)]/10 text-xl font-bold text-[var(--woody-text)]">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
          </div>
          {isOwnProfile && onEditProfile ? (
            <div className={cn(styles.actionsCol, "pt-4 sm:pt-5")}>
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
              <DropdownMenu>
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
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : !isOwnProfile && followSlot ? (
            <div className={cn(styles.actionsCol, "pt-4 sm:pt-5")}>{followSlot}</div>
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
                {profile.role ? (
                  <span className={styles.detailItem}>
                    <BriefcaseBusiness className={styles.detailIcon} aria-hidden />
                    <span className="truncate">{profile.role}</span>
                  </span>
                ) : null}
                {profile.location ? (
                  <span className={styles.detailItem}>
                    <MapPin className={styles.detailIcon} aria-hidden />
                    <span className="truncate">{profile.location}</span>
                  </span>
                ) : null}
                {profile.username ? (
                  <span className={styles.detailItem}>
                    <AtSign className={styles.detailIcon} aria-hidden />
                    <span className="truncate">@{profile.username}</span>
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
      </CardContent>
    </Card>
  );
}
