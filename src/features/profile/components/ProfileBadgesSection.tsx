import { useState } from "react";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { resolveBadgeIconSrc } from "../badges/badgeAssets";
import type { UserBadge } from "../types";
import { BadgeDetailDialog, BadgeIcon } from "./BadgeDetailDialog";

export interface ProfileBadgesSectionProps {
  badges: UserBadge[];
  className?: string;
}

export function ProfileBadgesSection({ badges, className }: ProfileBadgesSectionProps) {
  const [selectedBadge, setSelectedBadge] = useState<UserBadge | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (badges.length === 0) return null;

  const openBadge = (badge: UserBadge) => {
    setSelectedBadge(badge);
    setDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setSelectedBadge(null);
  };

  return (
    <>
      <section
        className={cn("mt-5 border-t border-[var(--woody-divider)]/70 pt-5", className)}
        aria-label="Insígnias"
      >
        <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--woody-muted)]">
          Insígnias
        </h2>

        <ul
          className="mt-3 flex flex-wrap gap-2 sm:gap-2.5"
          role="list"
        >
          {badges.map((badge) => {
            const hasImage = Boolean(resolveBadgeIconSrc(badge.iconAssetKey));

            return (
              <li key={badge.slug} className="min-w-0 max-w-full sm:max-w-none">
                <button
                  type="button"
                  onClick={() => openBadge(badge)}
                  className={cn(
                    woodyFocus.ring,
                    "group flex w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-xl border border-[var(--woody-divider)]",
                    "bg-[var(--woody-card)] px-2.5 py-2 text-left shadow-[0_1px_2px_rgba(10,10,10,0.03)]",
                    "transition-colors hover:border-[var(--woody-accent)]/25 hover:bg-[var(--woody-nav)]/[0.04]",
                    "sm:w-auto sm:max-w-[14rem]"
                  )}
                  aria-label={`Ver detalhes da insígnia ${badge.name}`}
                >
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg",
                      hasImage
                        ? "bg-[var(--woody-nav)]/[0.06]"
                        : "bg-[var(--woody-nav)]/10"
                    )}
                  >
                    <BadgeIcon
                      badge={badge}
                      className="size-9"
                      imageClassName="size-9 max-h-9 w-auto"
                    />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[var(--woody-text)]">
                      {badge.name}
                    </span>
                    {badge.description ? (
                      <span className="mt-0.5 line-clamp-1 text-xs leading-snug text-[var(--woody-muted)]">
                        {badge.description}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <BadgeDetailDialog
        badge={selectedBadge}
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
      />
    </>
  );
}
