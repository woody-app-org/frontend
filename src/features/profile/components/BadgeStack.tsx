import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import {
  PROFILE_BADGE_SIZE_PX,
  PROFILE_BADGE_STACK_OFFSET_PX,
  profileBadgeImageClass,
  profileBadgeSizeClass,
} from "../badges/badgeAssets";
import type { UserBadge } from "../types";
import { BadgeIcon } from "./BadgeDetailDialog";

export interface BadgeStackProps {
  badges: UserBadge[];
  onOpen: (initialIndex: number) => void;
  className?: string;
}

function ProfileBadgeCircle({ badge }: { badge: UserBadge }) {
  return (
    <BadgeIcon
      badge={badge}
      className={cn(profileBadgeSizeClass, "rounded-full")}
      imageClassName={profileBadgeImageClass}
    />
  );
}

export function BadgeStack({ badges, onOpen, className }: BadgeStackProps) {
  if (badges.length === 0) return null;

  if (badges.length === 1) {
    const badge = badges[0];
    return (
      <button
        type="button"
        aria-label={`Ver detalhes da insígnia ${badge.name}`}
        onClick={() => onOpen(0)}
        className={cn(
          woodyFocus.ring,
          profileBadgeSizeClass,
          "overflow-hidden rounded-full p-0 transition-transform active:scale-95",
          className
        )}
      >
        <ProfileBadgeCircle badge={badge} />
      </button>
    );
  }

  const stackWidth =
    PROFILE_BADGE_SIZE_PX + (badges.length - 1) * PROFILE_BADGE_STACK_OFFSET_PX;

  return (
    <button
      type="button"
      aria-label={`Ver ${badges.length} insígnias`}
      onClick={() => onOpen(0)}
      className={cn(
        woodyFocus.ring,
        "relative block transition-transform active:scale-[0.98]",
        className
      )}
      style={{ width: stackWidth, height: PROFILE_BADGE_SIZE_PX }}
    >
      {badges.map((badge, index) => (
        <span
          key={badge.slug}
          aria-hidden={index > 0}
          className={cn(
            profileBadgeSizeClass,
            "absolute top-0 overflow-hidden rounded-full shadow-[0_2px_8px_rgba(10,10,10,0.12)]"
          )}
          style={{
            left: index * PROFILE_BADGE_STACK_OFFSET_PX,
            zIndex: badges.length - index,
          }}
        >
          <ProfileBadgeCircle badge={badge} />
        </span>
      ))}
    </button>
  );
}
