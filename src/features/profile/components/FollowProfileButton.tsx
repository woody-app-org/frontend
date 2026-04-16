import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { useProfileFollow } from "../hooks/useProfileFollow";

const followPrimaryClass =
  "rounded-lg bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90 text-sm font-medium shrink-0 transition-transform active:scale-[0.98]";

const followingOutlineClass =
  "rounded-lg border border-[var(--woody-nav)]/35 bg-[var(--woody-nav)]/6 text-[var(--woody-text)] hover:bg-[var(--woody-nav)]/12 text-sm font-medium shrink-0 transition-transform active:scale-[0.98]";

export interface FollowProfileButtonProps {
  targetUserId: string;
  /** Para `aria-label` acessível (ex.: leitores de ecrã). */
  targetDisplayName?: string;
  initialIsFollowing: boolean | undefined;
  initialFollowersCount: number | undefined;
  onCommit: (patch: { isFollowing: boolean; followersCount: number }) => void;
  className?: string;
}

/**
 * Seguir / deixar de seguir no perfil (sessão obrigatória — o pai só monta quando autenticada).
 */
export function FollowProfileButton({
  targetUserId,
  targetDisplayName,
  initialIsFollowing,
  initialFollowersCount,
  onCommit,
  className,
}: FollowProfileButtonProps) {
  const { isFollowing, busy, error, clearError, toggleFollow } = useProfileFollow({
    targetUserId,
    enabled: true,
    initialIsFollowing,
    initialFollowersCount,
    onCommit,
  });

  const who = targetDisplayName?.trim() || "este perfil";
  const ariaLabel = busy
    ? "A atualizar relação de seguir"
    : isFollowing
      ? `Deixar de seguir ${who}`
      : `Seguir ${who}`;

  return (
    <div className={cn("flex min-w-0 flex-col items-stretch gap-1.5 sm:items-end", className)}>
      <Button
        type="button"
        variant={isFollowing ? "outline" : "secondary"}
        size="sm"
        disabled={busy}
        aria-busy={busy}
        aria-pressed={isFollowing}
        aria-label={ariaLabel}
        onClick={() => {
          clearError();
          void toggleFollow();
        }}
        className={cn(
          woodyFocus.ring,
          "touch-manipulation min-h-10 sm:min-h-9",
          isFollowing ? followingOutlineClass : followPrimaryClass,
          busy && "opacity-90"
        )}
      >
        {busy ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            <span>A atualizar…</span>
          </span>
        ) : isFollowing ? (
          "Seguindo"
        ) : (
          "Seguir"
        )}
      </Button>
      {error ? (
        <p className="max-w-[16rem] text-right text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
