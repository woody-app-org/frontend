import { Check, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Community } from "@/domain/types";
import { getCommunityCategoryLabel } from "@/features/communities/lib/communitiesPageModel";

export interface OnboardingCommunityToggleCardProps {
  community: Community;
  joined: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

function formatMemberCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")} mil`;
  return String(n);
}

/**
 * Card de comunidade no onboarding — alterna participação sem navegar para fora do fluxo.
 */
export function OnboardingCommunityToggleCard({
  community,
  joined,
  onToggle,
  disabled,
}: OnboardingCommunityToggleCardProps) {
  const categoryLabel = getCommunityCategoryLabel(community.category);
  const initials = community.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-white/14 bg-[var(--auth-panel-beige)]/[0.06] overflow-hidden transition-[box-shadow,border-color,transform] duration-200",
        joined && "ring-2 ring-[var(--auth-button)]/55 border-[var(--auth-button)]/40 shadow-md",
        !disabled && "hover:border-white/28"
      )}
    >
      <div className="relative h-20 sm:h-22 shrink-0">
        {community.coverUrl ? (
          <img src={community.coverUrl} alt="" className="size-full object-cover" loading="lazy" />
        ) : (
          <div
            className="size-full bg-gradient-to-br from-[var(--woody-nav)]/25 to-[var(--woody-accent)]/20"
            aria-hidden
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--auth-panel-maroon)]/95 via-transparent to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4 -mt-8 relative">
        <div className="flex gap-3">
          <div className="shrink-0">
            {community.avatarUrl ? (
              <img
                src={community.avatarUrl}
                alt=""
                className="size-12 rounded-xl border-2 border-[var(--auth-panel-maroon)] object-cover shadow-md"
                loading="lazy"
              />
            ) : (
              <span className="flex size-12 items-center justify-center rounded-xl border-2 border-[var(--auth-panel-maroon)] bg-[var(--auth-panel-beige)]/20 text-xs font-bold text-[var(--auth-text-on-maroon)]">
                {initials}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <h3 className="font-bold text-[var(--auth-text-on-maroon)] leading-snug line-clamp-2 text-sm sm:text-[0.95rem]">
              {community.name}
            </h3>
            <p className="mt-1 text-xs text-[var(--auth-text-on-maroon)]/75 line-clamp-2 leading-relaxed">
              {community.description}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[var(--auth-text-on-maroon)]/65">
              <span className="rounded-full bg-white/10 px-2 py-0.5 font-medium">{categoryLabel}</span>
              <span className="inline-flex items-center gap-1">
                <Users className="size-3 opacity-80" aria-hidden />
                {formatMemberCount(community.memberCount)} membros
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className={cn(
            "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-[colors,transform] duration-200 active:scale-[0.99]",
            joined
              ? "bg-[var(--auth-button)]/25 text-[var(--auth-text-on-maroon)] border border-[var(--auth-button)]/50"
              : "bg-[var(--auth-button)] text-white hover:bg-[var(--auth-button-hover)] border border-transparent",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--auth-ornament)]/50",
            "disabled:opacity-45 disabled:pointer-events-none"
          )}
        >
          {joined ? (
            <>
              <Check className="size-4" aria-hidden />
              Na comunidade
            </>
          ) : (
            "Entrar nesta comunidade"
          )}
        </button>
      </div>
    </div>
  );
}
