import { Link } from "react-router-dom";
import { Link2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { woodySurface } from "@/lib/woody-ui";
import type { UserProfile } from "../types";
import { ProfileAbout } from "./ProfileAbout";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export interface ProfileOverviewTabProps {
  profile: UserProfile;
  className?: string;
}

export function ProfileOverviewTab({ profile, className }: ProfileOverviewTabProps) {
  const hasExtras =
    profile.socialLinks.length > 0 || profile.interests.length > 0 || profile.suggestions.length > 0;

  return (
    <Card className={cn(woodySurface.card, className)}>
      <CardContent className="p-4 sm:p-6 space-y-8">
        <ProfileAbout bio={profile.bio} asPlain />

        {profile.location || profile.role ? (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--woody-muted)]">
            {profile.role ? <span>{profile.role}</span> : null}
            {profile.location ? <span>{profile.location}</span> : null}
          </div>
        ) : null}

        {profile.socialLinks.length > 0 ? (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-[var(--woody-text)]">Links</h3>
            <ul className="m-0 list-none space-y-1 p-0">
              {profile.socialLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 items-center gap-2 rounded-lg py-2 text-sm text-[var(--woody-text)] hover:bg-[var(--woody-nav)]/8"
                  >
                    <Link2 className="size-4 shrink-0 text-[var(--woody-muted)]" aria-hidden />
                    <span className="truncate">{link.label}</span>
                    {link.handle ? (
                      <span className="truncate text-[var(--woody-muted)]">{link.handle}</span>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {profile.interests.length > 0 ? (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-[var(--woody-text)]">Interesses</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium bg-[var(--woody-nav)]/10 text-[var(--woody-text)] border border-[var(--woody-accent)]/15"
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {profile.suggestions.length > 0 ? (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-[var(--woody-text)]">Talvez você conheça</h3>
            <ul className="m-0 list-none space-y-1 p-0">
              {profile.suggestions.map((user) => (
                <li key={user.id}>
                  <Link
                    to={`/profile/${user.id}`}
                    className="flex items-center gap-3 rounded-lg py-2 transition-colors hover:bg-[var(--woody-nav)]/8"
                  >
                    <Avatar className="size-9 shrink-0">
                      <AvatarImage src={user.avatarUrl ?? undefined} alt="" />
                      <AvatarFallback className="bg-[var(--woody-nav)]/10 text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-[var(--woody-text)]">{user.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {!hasExtras && !profile.bio ? (
          <div className="flex items-center gap-2 text-sm text-[var(--woody-muted)]">
            <Users className="size-4 shrink-0" aria-hidden />
            <span>Perfil ainda enxuto — em breve mais detalhes.</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
