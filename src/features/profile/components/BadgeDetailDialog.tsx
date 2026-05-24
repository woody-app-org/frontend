import { Award } from "lucide-react";
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
import { badgeCriteriaBySlug, resolveBadgeIconSrc } from "../badges/badgeAssets";
import type { UserBadge } from "../types";

export interface BadgeDetailDialogProps {
  badge: UserBadge | null;
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
        alt=""
        className={cn("object-contain", imageClassName, className)}
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

export function BadgeDetailDialog({ badge, open, onOpenChange }: BadgeDetailDialogProps) {
  if (!badge) return null;

  const criteria = badgeCriteriaBySlug[badge.slug];
  const earnedLabel =
    badge.earnedAt && !Number.isNaN(new Date(badge.earnedAt).getTime())
      ? formatDisplayDateFromIso(badge.earnedAt)
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          woodyDialogScroll,
          "max-w-sm gap-0 overflow-hidden border-[var(--woody-divider)] bg-[var(--woody-card)] p-0 sm:max-w-md"
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{badge.name}</DialogTitle>
          <DialogDescription>{badge.description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center px-6 pb-6 pt-8 text-center">
          <BadgeIcon
            badge={badge}
            className="size-28 sm:size-32"
            imageClassName="size-full max-h-32 w-auto"
          />

          <h2 className="mt-5 text-lg font-bold tracking-tight text-[var(--woody-text)]">
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
      </DialogContent>
    </Dialog>
  );
}

export { BadgeIcon };
