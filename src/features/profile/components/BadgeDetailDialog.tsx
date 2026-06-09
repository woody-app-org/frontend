import { Award } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDisplayDateFromIso } from "@/lib/formatIsoDate";
import { woodyDialogScroll, woodyFocus } from "@/lib/woody-ui";
import { useMatchMedia } from "@/lib/useMatchMedia";
import { badgeCriteriaBySlug, resolveBadgeIconSrc } from "../badges/badgeAssets";
import type { UserBadge } from "../types";
import { BadgeFlipCarousel } from "./BadgeFlipCarousel";

export interface BadgeDetailDialogProps {
  badges: UserBadge[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function BadgeIcon({
  badge,
  className,
  imageClassName,
}: {
  badge: UserBadge;
  className?: string;
  imageClassName?: string;
}) {
  const src = resolveBadgeIconSrc(badge.iconAssetKey);

  if (src) {
    return (
      <img
        src={src}
        alt={badge.name}
        className={cn("object-contain", className, imageClassName)}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-[var(--woody-nav)]/10 text-[var(--woody-nav)]",
        className
      )}
      aria-hidden
    >
      <Award className="size-[55%]" strokeWidth={2} />
    </span>
  );
}

function BadgeDetailText({ badge }: { badge: UserBadge }) {
  const criteria = badgeCriteriaBySlug[badge.slug];
  const earnedLabel =
    badge.earnedAt && !Number.isNaN(new Date(badge.earnedAt).getTime())
      ? formatDisplayDateFromIso(badge.earnedAt)
      : null;

  return (
    <>
      <h2 className="text-lg font-bold tracking-tight text-[var(--woody-text)] sm:text-xl">
        {badge.name}
      </h2>

      <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--woody-text)]/88">
        {badge.description}
      </p>

      {criteria ? (
        <p className="mt-4 max-w-sm text-xs leading-relaxed text-[var(--woody-muted)]">
          {criteria}
        </p>
      ) : null}

      {earnedLabel ? (
        <p className="mt-3 text-xs font-medium text-[var(--woody-muted)]">
          Conquistada em {earnedLabel}
        </p>
      ) : null}
    </>
  );
}

function BadgeDetailDialogView({
  badges,
  safeInitialIndex,
  isMobile,
}: {
  badges: UserBadge[];
  safeInitialIndex: number;
  isMobile: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(safeInitialIndex);

  const badge = badges[activeIndex] ?? badges[safeInitialIndex] ?? badges[0];
  const useCarousel = isMobile && badges.length > 1;
  const displayBadge = useCarousel
    ? (badges[activeIndex] ?? badge)
    : (badges[safeInitialIndex] ?? badge);

  if (!badge) return null;

  return (
    <>
      <DialogHeader className="sr-only">
        <DialogTitle>{badge.name}</DialogTitle>
        <DialogDescription>{badge.description}</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col items-center px-6 pb-6 pt-8 text-center">
        {useCarousel ? (
          <BadgeFlipCarousel
            badges={badges}
            initialIndex={safeInitialIndex}
            onIndexChange={setActiveIndex}
          />
        ) : (
          <BadgeIcon
            badge={displayBadge}
            className="size-32 rounded-full sm:size-40"
            imageClassName="size-32 h-full w-full rounded-full object-cover sm:size-40"
          />
        )}

        <div className={cn(useCarousel ? "mt-4 w-full" : "mt-6 w-full")}>
          <BadgeDetailText badge={displayBadge} />
        </div>

        <DialogClose asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "mt-6 min-h-10 w-full rounded-xl border-[var(--woody-accent)]/20 font-semibold",
              woodyFocus.ring
            )}
          >
            Fechar
          </Button>
        </DialogClose>
      </div>
    </>
  );
}

export function BadgeDetailDialog({
  badges,
  initialIndex = 0,
  open,
  onOpenChange,
}: BadgeDetailDialogProps) {
  const isMobile = useMatchMedia("(max-width: 767px)");
  const safeInitialIndex =
    badges.length === 0 ? 0 : Math.min(Math.max(initialIndex, 0), badges.length - 1);
  const badge = badges[safeInitialIndex] ?? badges[0];

  if (!badge) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          woodyDialogScroll,
          "max-w-sm gap-0 overflow-hidden border-[var(--woody-divider)] bg-[var(--woody-card)] p-0 sm:max-w-md"
        )}
      >
        {open ? (
          <BadgeDetailDialogView
            key={safeInitialIndex}
            badges={badges}
            safeInitialIndex={safeInitialIndex}
            isMobile={isMobile}
          />
        ) : (
          <DialogHeader className="sr-only">
            <DialogTitle>{badge.name}</DialogTitle>
            <DialogDescription>{badge.description}</DialogDescription>
          </DialogHeader>
        )}
      </DialogContent>
    </Dialog>
  );
}

export { BadgeIcon };
