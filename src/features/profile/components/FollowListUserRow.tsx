import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import type { User } from "@/domain/types";

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export interface FollowListUserRowProps {
  user: User;
  className?: string;
  onNavigate?: () => void;
}

export function FollowListUserRow({ user, className, onNavigate }: FollowListUserRowProps) {
  return (
    <li className={cn("list-none", className)}>
      <Link
        to={`/profile/${user.id}`}
        onClick={onNavigate}
        className={cn(
          woodyFocus.ring,
          "touch-manipulation flex min-w-0 items-center gap-3 rounded-xl px-2 py-2.5 sm:gap-3.5 sm:px-3 sm:py-3",
          "transition-colors hover:bg-[var(--woody-nav)]/8 active:bg-[var(--woody-nav)]/12"
        )}
      >
        <Avatar className="size-11 shrink-0 border border-[var(--woody-accent)]/12 sm:size-12">
          <AvatarImage src={user.avatarUrl ?? undefined} alt="" />
          <AvatarFallback className="bg-[var(--woody-nav)]/10 text-sm text-[var(--woody-text)]">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate font-medium text-[var(--woody-text)]">{user.name}</p>
          <p className="truncate text-sm text-[var(--woody-muted)]">@{user.username}</p>
        </div>
      </Link>
    </li>
  );
}
