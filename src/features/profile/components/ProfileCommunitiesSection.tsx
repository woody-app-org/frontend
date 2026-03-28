import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, UsersRound } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { woodyFocus, woodySurface } from "@/lib/woody-ui";
import type { Community } from "@/domain/types";
import { getCommunitiesForUser } from "@/domain/selectors";
import { getCommunityCategoryLabel } from "@/domain/categoryLabels";

const styles = {
  card: woodySurface.card,
  title: "text-base font-bold tracking-tight text-[var(--woody-text)] sm:text-lg",
  subtitle: "text-xs text-[var(--woody-muted)] mt-1 leading-relaxed",
  grid: "grid grid-cols-1 gap-3 sm:grid-cols-2",
  item: cn(
    woodyFocus.ring,
    "group flex min-w-0 items-center gap-3 rounded-xl border border-[var(--woody-accent)]/18",
    "bg-[var(--woody-bg)]/50 px-3 py-2.5 transition-[background-color,border-color] duration-200",
    "hover:border-[var(--woody-accent)]/28 hover:bg-[var(--woody-nav)]/[0.07]",
    "active:bg-[var(--woody-nav)]/[0.09]"
  ),
  avatar: "size-11 shrink-0 rounded-xl border border-[var(--woody-accent)]/15",
  name: "text-sm font-semibold text-[var(--woody-text)] truncate group-hover:text-[var(--woody-nav)] transition-colors",
  meta: "mt-0.5 flex flex-wrap items-center gap-2",
  cat: cn(
    "rounded-full bg-[var(--woody-nav)]/12 px-2 py-0.5 text-[0.6875rem] font-semibold",
    "text-[var(--woody-text)] ring-1 ring-[var(--woody-accent)]/12"
  ),
  emptyWrap: cn(
    woodySurface.emptyDashed,
    "flex flex-col items-center justify-center px-4 py-8 text-center"
  ),
  emptyIcon: "mb-3 flex size-11 items-center justify-center rounded-2xl bg-[var(--woody-nav)]/10 text-[var(--woody-nav)]",
  emptyTitle: "text-sm font-semibold text-[var(--woody-text)]",
  emptyDesc: "mt-1.5 max-w-sm text-xs leading-relaxed text-[var(--woody-muted)]",
};

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export interface ProfileCommunitiesSectionProps {
  userId: string;
  /** Se é o perfil da usuária logada (mock), ajusta o texto descritivo. */
  isOwnProfile?: boolean;
  /** Primeiro nome ou apelido para texto na terceira pessoa. */
  shortName?: string;
  /** Sem `Card` externo — útil dentro de abas. */
  bare?: boolean;
  className?: string;
}

/**
 * Comunidades em que a usuária participa (fonte: memberships do mock / futura API).
 */
export function ProfileCommunitiesSection({
  userId,
  isOwnProfile = false,
  shortName,
  bare = false,
  className,
}: ProfileCommunitiesSectionProps) {
  const communities = useMemo(() => getCommunitiesForUser(userId), [userId]);

  const blurb = isOwnProfile
    ? "Espaços onde você conversa e constrói vínculos na Woody."
    : `Espaços onde ${shortName ?? "esta pessoa"} participa na Woody.`;

  const body =
    communities.length === 0 ? (
      <div className={styles.emptyWrap}>
        <div className={styles.emptyIcon}>
          <UsersRound className="size-5" aria-hidden />
        </div>
        <p className={styles.emptyTitle}>Nenhuma comunidade ainda</p>
        <p className={styles.emptyDesc}>
          Quando houver participação em grupos, eles aparecerão aqui — parte central da identidade na
          plataforma.
        </p>
      </div>
    ) : (
      <ul className={cn(styles.grid, "list-none p-0 m-0")}>
        {communities.map((c) => (
          <li key={c.id}>
            <ProfileCommunityCompactLink community={c} />
          </li>
        ))}
      </ul>
    );

  if (bare) {
    return (
      <div className={cn("space-y-3", className)}>
        <p className={styles.subtitle}>{blurb}</p>
        {body}
      </div>
    );
  }

  return (
    <Card className={cn(styles.card, className)}>
      <CardHeader className="pb-1">
        <h2 id={`profile-communities-${userId}`} className={styles.title}>
          Comunidades
        </h2>
        <p className={styles.subtitle}>{blurb}</p>
      </CardHeader>
      <CardContent className="pt-0">{body}</CardContent>
    </Card>
  );
}

function ProfileCommunityCompactLink({ community }: { community: Community }) {
  const cat = getCommunityCategoryLabel(community.category);

  return (
    <Link to={`/communities/${community.slug}`} className={styles.item} aria-label={`Abrir comunidade ${community.name}`}>
      <Avatar className={styles.avatar}>
        <AvatarImage src={community.avatarUrl ?? undefined} alt="" className="object-cover" />
        <AvatarFallback className="rounded-xl bg-[var(--woody-nav)]/10 text-xs font-bold text-[var(--woody-text)]">
          {initials(community.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className={styles.name}>{community.name}</p>
        <div className={styles.meta}>
          <span className={styles.cat}>{cat}</span>
          <span className="text-[0.6875rem] text-[var(--woody-muted)]">
            {community.memberCount} {community.memberCount === 1 ? "membro" : "membros"}
          </span>
        </div>
      </div>
      <ChevronRight className="size-4 shrink-0 text-[var(--woody-muted)] opacity-60 group-hover:opacity-100" aria-hidden />
    </Link>
  );
}
