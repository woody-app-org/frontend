import { type ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const styles = {
  wrap: "relative pl-8",
  accentBar: "absolute left-0 top-0 h-full w-1 rounded-full bg-[var(--auth-button)]",
  title: "text-[2.65rem] leading-[0.95] md:text-6xl font-bold tracking-tight text-[var(--auth-text-on-beige)]",
  subtitle: "text-lg text-[var(--auth-text-on-beige)]/80 mt-6 leading-relaxed max-w-[26rem]",
  trustRow:
    "mt-8 inline-flex items-center gap-2 rounded-full border border-black/10 bg-[var(--auth-button)]/12 px-3 py-1.5 text-xs font-medium text-[var(--auth-text-on-beige)]/78",
  footerWrap: "mt-8 space-y-2",
  footerHint: "text-sm text-[var(--auth-text-on-beige)]",
  wave:
    "pointer-events-none absolute -bottom-10 -right-12 h-40 w-72 opacity-40 bg-[radial-gradient(120%_80%_at_70%_90%,rgba(139,195,74,0.22),rgba(255,255,255,0)_65%)]",
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
    <div className={cn("flex flex-col relative", styles.wrap, className)}>
      <span className={styles.accentBar} aria-hidden />
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.subtitle}>{subtitle}</p>
      <span className={styles.trustRow}>
        <ShieldCheck className="size-3.5 text-[var(--auth-button-hover)]" aria-hidden />
        Sua privacidade e bem-estar estão sempre em primeiro lugar.
      </span>
      {footer ? <div className={styles.footerWrap}>{footer}</div> : null}
      <span className={styles.wave} aria-hidden />
    </div>
  );
}
