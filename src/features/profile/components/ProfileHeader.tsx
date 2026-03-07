import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserProfile } from "../types";

const styles = {
  card:
    "rounded-2xl border border-[var(--woody-accent)]/20 bg-[var(--woody-card)] shadow-[0_1px_3px_rgba(92,58,59,0.06)] overflow-hidden",
  banner: "w-full h-28 sm:h-32 md:h-40 object-cover bg-[var(--woody-nav)]/10",
  content: "px-4 md:px-6 pb-4 md:pb-6",
  topRow: "flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 -mt-12 sm:-mt-14 md:-mt-16",
  avatarWrap: "shrink-0",
  avatar:
    "size-20 sm:size-[5.5rem] md:size-24 rounded-full border-4 border-[var(--woody-card)] shadow-md ring-2 ring-[var(--woody-accent)]/10",
  meta: "flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3",
  nameBlock: "min-w-0",
  name: "font-bold text-[var(--woody-text)] text-lg md:text-xl truncate",
  pronouns: "text-[var(--woody-muted)] text-sm",
  role: "text-[var(--woody-muted)] text-sm",
  location: "text-[var(--woody-muted)] text-sm",
  tags: "flex flex-wrap gap-2 mt-1",
  tag:
    "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium bg-[var(--woody-nav)]/10 text-[var(--woody-text)] border border-[var(--woody-accent)]/15",
  followBtn:
    "rounded-lg bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90 text-sm font-medium shrink-0",
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
}

export function ProfileHeader({ profile, className }: ProfileHeaderProps) {
  return (
    <Card className={cn(styles.card, className)}>
      <div className="relative">
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
              <AvatarFallback className="bg-[var(--woody-nav)]/10 text-[var(--woody-text)] text-lg">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
          </div>
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
            <Button className={styles.followBtn} variant="secondary" size="sm">
              {profile.isFollowing ? "Seguindo" : "Seguir"}
            </Button>
          </div>
        </div>
        {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
      </CardContent>
    </Card>
  );
}
