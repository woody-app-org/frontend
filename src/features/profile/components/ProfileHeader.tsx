import { Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import type { UserProfile } from "../types";

const styles = {
  card:
    "rounded-2xl border border-[var(--woody-accent)]/18 bg-[var(--woody-card)] shadow-[0_1px_3px_rgba(58,45,36,0.06)] overflow-hidden",
  bannerWrap: "w-full min-h-[10rem] sm:min-h-[12rem] md:min-h-[14rem] overflow-hidden",
  banner: "w-full h-40 sm:h-48 md:h-56 min-h-[10rem] sm:min-h-[12rem] md:min-h-[14rem] object-cover bg-[var(--woody-nav)]/10",
  content: "px-4 md:px-6 pt-2 pb-4 md:pb-6",
  avatarRow: "flex -mt-14 sm:-mt-16 md:-mt-20",
  avatarWrap: "shrink-0",
  avatar:
    "size-20 sm:size-[5.5rem] md:size-24 rounded-full border-4 border-[var(--woody-card)] shadow-md ring-2 ring-[var(--woody-accent)]/10",
  infoRow: "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mt-4",
  meta: "flex-1 min-w-0 flex flex-col gap-0.5",
  nameBlock: "min-w-0",
  name: "font-bold text-[var(--woody-text)] text-lg md:text-xl truncate",
  pronouns: "text-[var(--woody-muted)] text-sm",
  role: "text-[var(--woody-muted)] text-sm",
  location: "text-[var(--woody-muted)] text-sm",
  tags: "flex flex-wrap gap-2 mt-2",
  tag:
    "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium bg-[var(--woody-nav)]/10 text-[var(--woody-text)] border border-[var(--woody-accent)]/15",
  followBtn:
    "rounded-lg bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90 text-sm font-medium shrink-0 transition-transform active:scale-[0.98]",
  editBtn:
    "rounded-lg border border-[var(--woody-accent)]/25 bg-[var(--woody-bg)] text-[var(--woody-text)] hover:bg-[var(--woody-nav)]/8 text-sm font-medium shrink-0 transition-transform active:scale-[0.98]",
  bio: "text-[var(--woody-text)]/90 text-sm leading-relaxed mt-4 whitespace-pre-wrap break-words",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export interface ProfileHeaderProps {
  profile: UserProfile;
  className?: string;
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
}

export function ProfileHeader({ profile, className, isOwnProfile = false, onEditProfile }: ProfileHeaderProps) {
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
        <div className={styles.avatarRow}>
          <div className={styles.avatarWrap}>
            <Avatar className={styles.avatar}>
              <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.name} />
              <AvatarFallback className="bg-[var(--woody-nav)]/10 text-[var(--woody-text)] text-lg">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div className={styles.infoRow}>
          <div className={styles.meta}>
            <div className={styles.nameBlock}>
              <div className="flex flex-wrap items-baseline gap-1.5">
                <h1 className={styles.name}>{profile.name}</h1>
                {profile.pronouns && (
                  <>
                    <span className={styles.pronouns}>•</span>
                    <span className={styles.pronouns}>{profile.pronouns}</span>
                  </>
                )}
              </div>
              {profile.role && <p className={styles.role}>{profile.role}</p>}
              {profile.location && <p className={styles.location}>{profile.location}</p>}
              {profile.username ? (
                <p className="text-sm text-[var(--woody-muted)] mt-0.5">@{profile.username}</p>
              ) : null}
              {profile.interests.length > 0 && (
                <div className={styles.tags}>
                  {profile.interests.slice(0, 5).map((tag) => (
                    <span key={tag.id} className={styles.tag}>
                      {tag.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {isOwnProfile && onEditProfile ? (
            <Button
              type="button"
              className={cn(styles.editBtn, woodyFocus.ring)}
              variant="outline"
              size="sm"
              onClick={onEditProfile}
            >
              <Pencil className="size-4" />
              Ajustar meu perfil
            </Button>
          ) : !isOwnProfile ? (
            <Button className={cn(styles.followBtn, woodyFocus.ring)} variant="secondary" size="sm">
              {profile.isFollowing ? "Seguindo" : "Seguir"}
            </Button>
          ) : null}
        </div>
        {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
      </CardContent>
    </Card>
  );
}
