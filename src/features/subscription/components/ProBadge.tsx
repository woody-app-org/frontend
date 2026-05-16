import { cn } from "@/lib/utils";

const baseClass =
  "inline-flex shrink-0 items-center rounded-md border border-amber-500/35 bg-amber-500/12 font-semibold uppercase tracking-wide text-amber-950 dark:text-amber-100";

export type ProBadgeVariant = "inline" | "profile";

export interface ProBadgeProps {
  className?: string;
  /** `profile`: cabeçalho de perfil; `inline`: cartões, posts e listas (mais compacto). */
  variant?: ProBadgeVariant;
}

/**
 * Selo visual Woody Pro — alinhado ao tema (âmbar suave). A regra de negócio vem de `showProBadge` / sessão;
 * este componente é só apresentação.
 */
export function ProBadge({ className, variant = "inline" }: ProBadgeProps) {
  const sizeClass = variant === "profile" ? "px-1.5 py-0.5 text-[10px]" : "px-1 py-px text-[9px] leading-tight";
  return (
    <span className={cn(baseClass, sizeClass, className)} title="Woody Pro">
      Pro
    </span>
  );
}
