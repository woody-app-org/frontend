import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { formatDisplayDateFromIso } from "@/lib/formatIsoDate";
import { badgeCriteriaBySlug, profileBadgeImageClass, profileBadgeSizeClass } from "../badges/badgeAssets";
import type { UserBadge } from "../types";
import { BadgeDetailDialog, BadgeIcon } from "./BadgeDetailDialog";
import { BadgeStack } from "./BadgeStack";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ProfileBadgesSectionProps {
  badges: UserBadge[];
  className?: string;
}

function BadgePopoverCard({ badge }: { badge: UserBadge }) {
  const criteria = badgeCriteriaBySlug[badge.slug];
  const earnedLabel =
    badge.earnedAt && !Number.isNaN(new Date(badge.earnedAt).getTime())
      ? formatDisplayDateFromIso(badge.earnedAt)
      : null;

  return (
    <div className="flex flex-col items-center px-5 pb-5 pt-6 text-center w-64 sm:w-72">
      <BadgeIcon
        badge={badge}
        className="size-24 sm:size-28 rounded-full"
        imageClassName="size-24 sm:size-28 h-full w-full rounded-full object-cover"
      />
      <p className="mt-4 text-base font-bold text-[var(--woody-text)] leading-tight">
        {badge.name}
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-[var(--woody-text)]/80">
        {badge.description}
      </p>
      {criteria ? (
        <p className="mt-2 text-xs leading-relaxed text-[var(--woody-muted)]">
          {criteria}
        </p>
      ) : null}
      {earnedLabel ? (
        <p className="mt-2 text-[10px] font-medium text-[var(--woody-muted)]">
          Conquistada em {earnedLabel}
        </p>
      ) : null}
    </div>
  );
}

export function ProfileBadgesSection({ badges, className }: ProfileBadgesSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogInitialIndex, setDialogInitialIndex] = useState(0);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const hoverIntentRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (badges.length === 0) return null;

  const openDialog = (index: number) => {
    setHoveredSlug(null);
    setDialogInitialIndex(index);
    setDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
  };

  const scheduleClose = () => {
    hoverIntentRef.current = setTimeout(() => setHoveredSlug(null), 120);
  };

  const cancelClose = () => {
    if (hoverIntentRef.current) {
      clearTimeout(hoverIntentRef.current);
      hoverIntentRef.current = null;
    }
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

        {/* Mobile: empilhadas estilo GitHub */}
        <div className="mt-3 sm:hidden">
          <BadgeStack badges={badges} onOpen={openDialog} />
        </div>

        {/* Desktop: ícones lado a lado + popover no hover */}
        <ul className="mt-3 hidden flex-wrap gap-3 sm:flex" role="list">
          {badges.map((badge, index) => (
            <li key={badge.slug}>
              <Popover
                open={hoveredSlug === badge.slug}
                onOpenChange={(open) => {
                  if (!open) setHoveredSlug(null);
                }}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label={`Ver detalhes da insígnia ${badge.name}`}
                    onClick={() => openDialog(index)}
                    onMouseEnter={() => {
                      cancelClose();
                      setHoveredSlug(badge.slug);
                    }}
                    onMouseLeave={scheduleClose}
                    className={cn(
                      woodyFocus.ring,
                      "group cursor-pointer overflow-hidden rounded-full p-0",
                      profileBadgeSizeClass,
                      "transition-transform duration-150 hover:scale-110 active:scale-100"
                    )}
                  >
                    <BadgeIcon
                      badge={badge}
                      className={cn(profileBadgeSizeClass, "rounded-full")}
                      imageClassName={profileBadgeImageClass}
                    />
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  side="top"
                  align="center"
                  sideOffset={8}
                  className="hidden sm:block w-auto max-w-none p-0 rounded-2xl border border-[var(--woody-divider)] bg-[var(--woody-card)] shadow-xl"
                  onMouseEnter={cancelClose}
                  onMouseLeave={scheduleClose}
                  onPointerDownOutside={(e) => e.preventDefault()}
                  onInteractOutside={(e) => e.preventDefault()}
                >
                  <BadgePopoverCard badge={badge} />
                </PopoverContent>
              </Popover>
            </li>
          ))}
        </ul>
      </section>

      <BadgeDetailDialog
        badges={badges}
        initialIndex={dialogInitialIndex}
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
      />
    </>
  );
}
