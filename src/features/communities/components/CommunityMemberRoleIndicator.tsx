import { Crown, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommunityMemberRole } from "@/domain/types";
import { getCommunityMemberRolePublicLabel } from "@/domain/communityMemberRole";

export type CommunityMemberRoleIndicatorVariant = "profile" | "participant";

export interface CommunityMemberRoleIndicatorProps {
  role: CommunityMemberRole;
  variant: CommunityMemberRoleIndicatorVariant;
  className?: string;
}

/**
 * Indicador discreto de papel (perfil) ou hierárquico (“quem participa”).
 * Membros comuns: no perfil recebem chip neutro; na lista de participantes, sem extra.
 */
export function CommunityMemberRoleIndicator({ role, variant, className }: CommunityMemberRoleIndicatorProps) {
  const label = getCommunityMemberRolePublicLabel(role);

  if (variant === "participant") {
    if (role === "member") return null;
    if (role === "owner") {
      return (
        <span
          className={cn(
            "inline-flex max-w-full shrink-0 items-center gap-0.5 rounded-full py-px pl-1 pr-1.5",
            "bg-[var(--woody-nav)]/12 text-[0.65rem] font-semibold text-[var(--woody-nav)] ring-1 ring-[var(--woody-nav)]/22",
            className
          )}
        >
          <Crown className="size-3 shrink-0 opacity-90" aria-hidden />
          <span className="truncate">{label}</span>
        </span>
      );
    }
    return (
      <span
        className={cn(
          "inline-flex max-w-full shrink-0 items-center gap-0.5 text-[0.65rem] font-medium text-[var(--woody-muted)]",
          className
        )}
      >
        <Shield className="size-3 shrink-0 opacity-75" aria-hidden />
        <span className="truncate">{label}</span>
      </span>
    );
  }

  /* profile */
  if (role === "owner") {
    return (
      <span
        className={cn(
          "inline-flex max-w-full items-center gap-0.5 rounded-full px-1.5 py-px text-[0.65rem] font-semibold",
          "bg-[var(--woody-nav)]/10 text-[var(--woody-text)] ring-1 ring-[var(--woody-nav)]/18",
          className
        )}
      >
        <Crown className="size-3 shrink-0 text-[var(--woody-nav)] opacity-90" aria-hidden />
        {label}
      </span>
    );
  }
  if (role === "admin") {
    return (
      <span
        className={cn(
          "inline-flex max-w-full items-center gap-0.5 rounded-full px-1.5 py-px text-[0.65rem] font-semibold",
          "bg-amber-500/8 text-[var(--woody-text)] ring-1 ring-amber-500/14",
          className
        )}
      >
        <Shield className="size-3 shrink-0 text-amber-700/80 dark:text-amber-300/90" aria-hidden />
        {label}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex max-w-full rounded-full bg-[var(--woody-nav)]/6 px-1.5 py-px text-[0.65rem] font-medium",
        "text-[var(--woody-muted)] ring-1 ring-[var(--woody-accent)]/8",
        className
      )}
    >
      {label}
    </span>
  );
}
