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
        "flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-[var(--woody-muted)]",
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
          "touch-manipulation min-h-11 rounded-md px-1.5 py-1.5 text-left font-medium text-[var(--woody-text)]/90 underline-offset-2 hover:underline sm:min-h-0 sm:px-1 sm:py-0.5"
        )}
      >
        <span className="tabular-nums text-[var(--woody-text)]">{fmt(followersCount)}</span>
        <span className="ml-1 font-normal text-[var(--woody-muted)]">
          {followersCount === 1 ? "seguidor" : "seguidores"}
        </span>
      </button>
      <span className="select-none text-[var(--woody-accent)]/35" aria-hidden>
        ·
      </span>
      <button
        type="button"
        onClick={onOpenFollowing}
        title="Ver lista de contas a seguir"
        className={cn(
          woodyFocus.ring,
          "touch-manipulation min-h-11 rounded-md px-1.5 py-1.5 text-left font-medium text-[var(--woody-text)]/90 underline-offset-2 hover:underline sm:min-h-0 sm:px-1 sm:py-0.5"
        )}
      >
        <span className="tabular-nums text-[var(--woody-text)]">{fmt(followingCount)}</span>
        <span className="ml-1 font-normal text-[var(--woody-muted)]">a seguir</span>
      </button>
    </div>
  );
}
