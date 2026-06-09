import { cn } from "@/lib/utils";

export type ProBadgeVariant = "inline" | "profile";
export type SubscriptionBadgeTier = "pro" | "max";

export interface ProBadgeProps {
  className?: string;
  /** `profile`: cabeçalho de perfil; `inline`: cartões, posts e listas (mais compacto). */
  variant?: ProBadgeVariant;
  /** Tier do badge; omitir usa `"pro"` por compatibilidade. */
  tier?: SubscriptionBadgeTier;
}

/**
 * Selo visual de assinatura (Pro ou Max). A regra de negócio vem de `subscriptionBadge` / sessão;
 * este componente é só apresentação.
 */
export function ProBadge({ className, variant = "inline", tier = "pro" }: ProBadgeProps) {
  const sizeClass = variant === "profile" ? "px-1.5 py-0.5 text-[10px]" : "px-1 py-px text-[9px] leading-tight";

  if (tier === "max") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center rounded-md border border-violet-500/35 bg-violet-500/12 font-semibold uppercase tracking-wide text-violet-950 dark:text-violet-100",
          sizeClass,
          className,
        )}
        title="Woody Max"
      >
        Max
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md border border-amber-500/35 bg-amber-500/12 font-semibold uppercase tracking-wide text-amber-950 dark:text-amber-100",
        sizeClass,
        className,
      )}
      title="Woody Pro"
    >
      Pro
    </span>
  );
}
