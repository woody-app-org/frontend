import { Crown, Star } from "lucide-react";
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
 * Selo visual de assinatura (Pro ou Max), inspirado em ícones de rank de jogos:
 * Pro remete a um rank "Ouro" e Max a um rank "Mestre". A regra de negócio vem de
 * `subscriptionBadge` / sessão; este componente é só apresentação.
 */
export function ProBadge({ className, variant = "inline", tier = "pro" }: ProBadgeProps) {
  const sizeClass =
    variant === "profile"
      ? "gap-1 px-1.5 py-0.5 text-[10px]"
      : "gap-0.5 px-1 py-px text-[9px] leading-tight";
  const iconSizeClass = variant === "profile" ? "size-3" : "size-2.5";

  if (tier === "max") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center rounded-md border border-fuchsia-300/40 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-purple-700 font-bold uppercase tracking-wide text-white shadow-[0_0_8px_rgba(192,38,211,0.55)]",
          sizeClass,
          className,
        )}
        title="Woody Max"
      >
        <Crown className={cn(iconSizeClass, "text-fuchsia-200 drop-shadow-[0_0_2px_rgba(255,255,255,0.6)]")} />
        Max
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md border border-amber-200/50 bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 font-bold uppercase tracking-wide text-amber-950 shadow-[0_0_8px_rgba(245,158,11,0.55)]",
        sizeClass,
        className,
      )}
      title="Woody Pro"
    >
      <Star className={cn(iconSizeClass, "fill-amber-100 text-amber-100 drop-shadow-[0_0_2px_rgba(255,255,255,0.6)]")} />
      Pro
    </span>
  );
}
