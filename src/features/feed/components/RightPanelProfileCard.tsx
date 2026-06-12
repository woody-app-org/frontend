import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ProBadge } from "@/features/subscription/components/ProBadge";
import { resolvePublicMediaUrl } from "@/lib/api";
import { profilePathForUser } from "@/features/profile/lib/profilePaths";
import type { AuthUser } from "@/features/auth/types";
import { cn } from "@/lib/utils";

function getInitials(name?: string, username?: string): string {
  const display = (name?.trim() || username || "?");
  const parts = display.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return display.slice(0, 2).toUpperCase();
}

export interface RightPanelProfileCardProps {
  user: AuthUser;
}

/**
 * Mini profile card exibido no RightPanel.
 * Usa apenas dados do AuthUser (já presentes no contexto — sem request extra).
 * Campos opcionais recebem fallback visual elegante quando ausentes.
 */
export function RightPanelProfileCard({ user }: RightPanelProfileCardProps) {
  const profilePath = profilePathForUser({ id: user.id, username: user.username });
  const avatarUrl = user.avatarUrl ? resolvePublicMediaUrl(user.avatarUrl) : null;
  const bannerUrl = user.bannerUrl ? resolvePublicMediaUrl(user.bannerUrl) : null;
  const bannerKey = user.bannerUrl ?? "";
  const [loadedBannerKey, setLoadedBannerKey] = useState("");
  const bannerLoaded = bannerKey !== "" && loadedBannerKey === bannerKey;

  const displayName = user.name?.trim() || user.username;
  const badgeTier = user.subscription?.subscriptionBadge ?? null;

  return (
    <article
      className="overflow-hidden rounded-2xl border border-black/[0.07] bg-[var(--woody-card)] shadow-[0_2px_10px_rgba(10,10,10,0.04),0_0_0_1px_rgba(255,255,255,0.65)_inset]"
      aria-label={`Perfil de ${displayName}`}
    >
      {/* ── Banner ─────────────────────────────────────────────────────── */}
      <Link
        to={profilePath}
        aria-label={`Ver perfil de ${displayName}`}
        tabIndex={-1}
        aria-hidden
      >
        <div className="relative h-[5.5rem] w-full overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-br from-[var(--woody-nav)]/28 via-[var(--woody-accent)]/14 to-[var(--woody-nav)]/22"
            aria-hidden
          />
          {bannerUrl ? (
            <img
              key={bannerKey}
              src={bannerUrl}
              alt=""
              aria-hidden
              className={cn(
                "relative h-full w-full object-cover transition-opacity duration-300",
                bannerLoaded ? "opacity-100" : "opacity-0"
              )}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              onLoad={() => setLoadedBannerKey(bannerKey)}
            />
          ) : null}
        </div>
      </Link>

      {/* ── Área de conteúdo ───────────────────────────────────────────── */}
      <div className="px-3.5 pb-4">
        {/* Avatar sobreposto ao banner + botão Editar */}
        <div className="-mt-7 mb-3 flex items-end justify-between">
          <Link
            to={profilePath}
            aria-label={`Ver perfil de ${displayName}`}
            className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/35 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--woody-card)]"
          >
            <Avatar className="size-[3.5rem] shadow-sm">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={displayName} />
              ) : null}
              <AvatarFallback className="bg-[var(--woody-nav)]/12 text-sm font-bold text-[var(--woody-nav)]">
                {getInitials(user.name, user.username)}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>

        {/* Nome + ProBadge */}
        <Link
          to={profilePath}
          className="group block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/30"
        >
          <div className="flex flex-wrap items-baseline gap-1.5 leading-tight">
            <span className="line-clamp-1 break-all text-[1rem] font-bold text-[var(--woody-text)] underline-offset-2 group-hover:underline decoration-[var(--woody-nav)]/60">
              {displayName}
            </span>
            {badgeTier && <ProBadge variant="inline" tier={badgeTier} />}
          </div>
          <p className="mt-0.5 text-[0.8125rem] text-[var(--woody-muted)]">
            {user.username}
          </p>
        </Link>

        {/* Pronomes */}
        {user.pronouns ? (
          <p className="mt-0.5 text-[0.75rem] leading-snug text-[var(--woody-muted)]/80">
            {user.pronouns}
          </p>
        ) : null}

        {/* Bio */}
        {user.bio ? (
          <p className="mt-2 line-clamp-2 text-[0.8125rem] leading-snug text-[var(--woody-text)]/85">
            {user.bio}
          </p>
        ) : null}

        {/* Localização */}
        {user.location ? (
          <p className="mt-1.5 flex items-center gap-1 text-[0.75rem] text-[var(--woody-muted)]">
            <MapPin className="size-3 shrink-0" aria-hidden />
            {user.location}
          </p>
        ) : null}

        {/* Link "Ver perfil" */}
        <Link
          to={profilePath}
          className={[
            "mt-3 flex h-8 w-full items-center justify-center rounded-xl",
            "border border-[var(--woody-nav)]/30 text-[0.8125rem] font-semibold text-[var(--woody-nav)]",
            "transition-colors hover:bg-[var(--woody-nav)]/8",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/30",
          ].join(" ")}
        >
          Ver perfil
        </Link>
      </div>
    </article>
  );
}
