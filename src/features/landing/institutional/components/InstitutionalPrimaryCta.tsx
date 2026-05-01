import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export interface InstitutionalPrimaryCtaProps {
  children: React.ReactNode;
  /** Navegação interna. */
  to?: string;
  href?: string;
  /** Botão nativo (ex.: «Ler mais» sem navegação). */
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "lime" | "dark" | "ghost" | "limeSolid";
  className?: string;
  showChevron?: boolean;
}

const base =
  "group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold tracking-tight transition-[transform,box-shadow,background-color,color,border-color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-lime)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f2ec] motion-safe:hover:-translate-y-0.5";

const variants: Record<NonNullable<InstitutionalPrimaryCtaProps["variant"]>, string> = {
  lime:
    "border border-[var(--woody-lime)]/55 bg-[var(--woody-lime)] text-[var(--woody-ink)] shadow-[0_0_0_1px_rgba(139,195,74,0.25),0_12px_36px_-8px_rgba(139,195,74,0.45)] hover:border-[var(--woody-lime)] hover:bg-[#9ad154] hover:shadow-[0_0_0_1px_rgba(139,195,74,0.4),0_16px_44px_-6px_rgba(139,195,74,0.55)]",
  limeSolid:
    "rounded-lg border-0 bg-[#8dbf43] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_12px_32px_-10px_rgba(141,191,67,0.55)] hover:bg-[#9ad154] hover:shadow-[0_16px_40px_-8px_rgba(141,191,67,0.6)] focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/60",
  dark:
    "border border-black/10 bg-[var(--woody-ink)] text-[var(--woody-lime)] shadow-[0_0_0_1px_rgba(139,195,74,0.35),0_14px_40px_rgba(10,10,10,0.25)] hover:bg-black hover:shadow-[0_0_0_1px_rgba(139,195,74,0.5),0_18px_48px_rgba(10,10,10,0.3)]",
  ghost:
    "border border-black/10 bg-white/70 text-[var(--woody-ink)] backdrop-blur-sm hover:border-[var(--woody-lime)]/45 hover:bg-white",
};

export function InstitutionalPrimaryCta({
  children,
  to,
  href,
  onClick,
  type = "button",
  variant = "lime",
  className,
  showChevron = true,
}: InstitutionalPrimaryCtaProps) {
  const cls = cn(base, variants[variant], className);
  const icon = (
    <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
  );
  const content = (
    <>
      {children}
      {showChevron ? icon : null}
    </>
  );

  if (onClick) {
    return (
      <button type={type} onClick={onClick} className={cls}>
        {content}
      </button>
    );
  }

  if (to) {
    return (
      <Link to={to} className={cls}>
        {content}
      </Link>
    );
  }
  if (href !== undefined) {
    return (
      <a href={href} className={cls}>
        {content}
      </a>
    );
  }
  return null;
}
