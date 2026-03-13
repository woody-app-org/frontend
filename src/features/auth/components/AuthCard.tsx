import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

const styles = {
  card: "w-full max-w-4xl rounded-3xl overflow-hidden shadow-xl flex flex-col md:flex-row min-h-0",
  panelBeige: "bg-[var(--auth-panel-beige)] text-[var(--auth-text-on-beige)] flex flex-col justify-center p-6 md:p-8 md:min-w-[280px] md:flex-1",
  panelMaroon: "bg-[var(--auth-panel-maroon)] text-[var(--auth-text-on-maroon)] flex flex-col justify-center p-6 md:p-8 md:min-w-[280px] md:flex-1",
} as const;

export interface AuthCardProps {
  /** Conteúdo do painel bege (geralmente mensagem ou formulário) */
  panelBeigeContent: ReactNode;
  /** Conteúdo do painel marrom (formulário ou mensagem) */
  panelMaroonContent: ReactNode;
  /** No mobile, true = painel bege em cima; false = painel marrom em cima */
  beigeFirst?: boolean;
  className?: string;
}

export function AuthCard({
  panelBeigeContent,
  panelMaroonContent,
  beigeFirst = true,
  className,
}: AuthCardProps) {
  return (
    <article
      className={cn(styles.card, className)}
      role="region"
      aria-label="Autenticação"
    >
      {beigeFirst ? (
        <>
          <div className={styles.panelBeige}>{panelBeigeContent}</div>
          <div className={styles.panelMaroon}>{panelMaroonContent}</div>
        </>
      ) : (
        <>
          <div className={styles.panelMaroon}>{panelMaroonContent}</div>
          <div className={styles.panelBeige}>{panelBeigeContent}</div>
        </>
      )}
    </article>
  );
}
