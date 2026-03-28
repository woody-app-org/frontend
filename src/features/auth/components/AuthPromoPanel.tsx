import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

const styles = {
  title: "text-2xl md:text-3xl font-bold text-[var(--auth-text-on-beige)]",
  subtitle: "text-sm md:text-base text-[var(--auth-text-on-beige)]/90 mt-2",
  footerWrap: "mt-6 space-y-2",
  footerHint: "text-sm text-[var(--auth-text-on-beige)]",
} as const;

export interface AuthPromoPanelProps {
  title: string;
  subtitle: string;
  /** CTA secundário (ex.: link para cadastro ou login) */
  footer?: ReactNode;
  className?: string;
}

/**
 * Painel bege lateral da auth — mensagem de boas-vindas e CTA opcional.
 * Substitui o antigo fluxo de “trocar modo” no mesmo card.
 */
export function AuthPromoPanel({ title, subtitle, footer, className }: AuthPromoPanelProps) {
  return (
    <div className={cn("flex flex-col relative", className)}>
      <span
        className="absolute top-0 left-0 text-[var(--auth-panel-maroon)]/20 font-bold text-6xl md:text-7xl select-none pointer-events-none leading-none"
        aria-hidden
      >
        W
      </span>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.subtitle}>{subtitle}</p>
      {footer ? <div className={styles.footerWrap}>{footer}</div> : null}
    </div>
  );
}
