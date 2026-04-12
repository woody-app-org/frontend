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
        className={cn(
          woodyFocus.ring,
          "rounded-md px-1 py-0.5 text-left font-medium text-[var(--woody-text)]/90 underline-offset-2 hover:underline"
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
        className={cn(
          woodyFocus.ring,
          "rounded-md px-1 py-0.5 text-left font-medium text-[var(--woody-text)]/90 underline-offset-2 hover:underline"
        )}
      >
        <span className="tabular-nums text-[var(--woody-text)]">{fmt(followingCount)}</span>
        <span className="ml-1 font-normal text-[var(--woody-muted)]">a seguir</span>
      </button>
    </div>
  );
}
