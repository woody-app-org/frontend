import { UserRoundCheck, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";

function fmt(n: number): string {
  return n.toLocaleString("pt-PT");
}

export interface ProfileFollowStatsProps {
  followersCount: number;
  followingCount: number;
  onOpenFollowers: () => void;
  onOpenFollowing: () => void;
  className?: string;
}

/**
 * Contadores compactos sob o identificador do perfil; abrem o diálogo de listas.
 */
export function ProfileFollowStats({
  followersCount,
  followingCount,
  onOpenFollowers,
  onOpenFollowing,
  className,
}: ProfileFollowStatsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 text-sm text-[var(--woody-muted)]",
        className
      )}
      aria-label="Seguidores e contas seguidas"
    >
      <button
        type="button"
        onClick={onOpenFollowers}
        title="Ver lista de seguidores"
        className={cn(
          woodyFocus.ring,
          "group inline-flex touch-manipulation items-center gap-2 rounded-xl border border-transparent px-1.5 py-1.5 text-left transition-colors hover:border-[var(--woody-accent)]/14 hover:bg-[var(--woody-nav)]/7"
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--woody-tag-bg)] text-[var(--woody-nav)] ring-1 ring-[var(--woody-accent)]/16">
          <UsersRound className="size-4" aria-hidden />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="tabular-nums font-bold text-[var(--woody-text)]">{fmt(followersCount)}</span>
          <span className="text-xs font-medium text-[var(--woody-muted)]">
            {followersCount === 1 ? "seguidor" : "seguidores"}
          </span>
        </span>
      </button>
      <button
        type="button"
        onClick={onOpenFollowing}
        title="Ver lista de contas a seguir"
        className={cn(
          woodyFocus.ring,
          "group inline-flex touch-manipulation items-center gap-2 rounded-xl border border-transparent px-1.5 py-1.5 text-left transition-colors hover:border-[var(--woody-accent)]/14 hover:bg-[var(--woody-nav)]/7"
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--woody-tag-bg)] text-[var(--woody-nav)] ring-1 ring-[var(--woody-accent)]/16">
          <UserRoundCheck className="size-4" aria-hidden />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="tabular-nums font-bold text-[var(--woody-text)]">{fmt(followingCount)}</span>
          <span className="text-xs font-medium text-[var(--woody-muted)]">a seguir</span>
        </span>
      </button>
    </div>
  );
}
