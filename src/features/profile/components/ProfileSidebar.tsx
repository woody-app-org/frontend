import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Link2, Users } from "lucide-react";
import type { UserProfile } from "../types";

const styles = {
  wrapper: "hidden md:flex flex-col w-full min-w-0 space-y-4",
  card:
    "rounded-2xl border border-[var(--woody-accent)]/20 bg-[var(--woody-card)] shadow-[0_1px_3px_rgba(92,58,59,0.06)]",
  cardHeader: "px-4 pt-4 pb-1",
  title: "text-base font-bold text-[var(--woody-text)]",
  cardContent: "p-4 pt-0",
  linkRow:
    "flex items-center gap-2 rounded-md py-2 px-1 -mx-1 text-sm text-[var(--woody-text)] hover:bg-[var(--woody-nav)]/8 transition-colors min-w-0",
  linkIcon: "size-4 shrink-0 text-[var(--woody-muted)]",
  linkHandle: "truncate text-[var(--woody-muted)]",
  suggestionRow:
    "flex items-center gap-3 rounded-md py-2 px-1 -mx-1 cursor-pointer transition-colors min-w-0 hover:bg-[var(--woody-nav)]/8",
  suggestionAvatar: "size-9 shrink-0",
  suggestionName: "text-sm font-medium text-[var(--woody-text)] truncate min-w-0",
  tag: "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium bg-[var(--woody-nav)]/10 text-[var(--woody-text)] border border-[var(--woody-accent)]/15",
  tagsWrap: "flex flex-wrap gap-2",
  subtitle: "text-xs text-[var(--woody-muted)] mb-1",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export interface ProfileSidebarProps {
  profile: UserProfile;
  className?: string;
}

export function ProfileSidebar({ profile, className }: ProfileSidebarProps) {
  return (
    <aside className={cn(styles.wrapper, className)}>
      {profile.socialLinks.length > 0 && (
        <Card className={styles.card}>
          <CardHeader className={styles.cardHeader}>
            <h2 className={styles.title}>Conexões</h2>
          </CardHeader>
          <CardContent className={styles.cardContent}>
            <ul className="space-y-0 list-none p-0 m-0">
              {profile.socialLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.linkRow}
                  >
                    <Link2 className={styles.linkIcon} aria-hidden />
                    <span className="truncate">{link.label}</span>
                    {link.handle && (
                      <span className={cn(styles.linkHandle, "ml-1")}>{link.handle}</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {profile.suggestions.length > 0 && (
        <Card className={styles.card}>
          <CardHeader className={styles.cardHeader}>
            <p className={styles.subtitle}>olha como vocês são parecidos 0-0</p>
            <h2 className={styles.title}>Talvez você conheça</h2>
          </CardHeader>
          <CardContent className={styles.cardContent}>
            <ul className="space-y-0 list-none p-0 m-0">
              {profile.suggestions.map((user) => (
                <li key={user.id}>
                  <Link
                    to={`/profile/${user.id}`}
                    className={styles.suggestionRow}
                    aria-label={`Ver perfil de ${user.name}`}
                  >
                    <Avatar size="default" className={styles.suggestionAvatar}>
                      <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                      <AvatarFallback className="bg-[var(--woody-nav)]/10 text-[var(--woody-text)] text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className={styles.suggestionName}>{user.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {profile.interests.length > 0 && (
        <Card className={styles.card}>
          <CardHeader className={styles.cardHeader}>
            <h2 className={styles.title}>Interesses</h2>
          </CardHeader>
          <CardContent className={styles.cardContent}>
            <div className={styles.tagsWrap}>
              {profile.interests.map((tag) => (
                <span key={tag.id} className={styles.tag}>
                  {tag.label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {profile.socialLinks.length === 0 &&
        profile.suggestions.length === 0 &&
        profile.interests.length === 0 && (
          <Card className={styles.card}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-[var(--woody-muted)]">
                <Users className="size-4 shrink-0" aria-hidden />
                <span>Nada por aqui ainda.</span>
              </div>
            </CardContent>
          </Card>
        )}
    </aside>
  );
}
