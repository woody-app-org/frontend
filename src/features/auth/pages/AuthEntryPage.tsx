import { Link } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { AuthCard } from "../components/AuthCard";
import { AuthPromoPanel } from "../components/AuthPromoPanel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const styles = {
  panelTitle: "text-xl md:text-2xl font-bold text-[var(--auth-text-on-beige)] md:text-[var(--auth-text-on-maroon)] text-center md:text-left",
  panelLead:
    "text-sm text-[var(--auth-text-on-beige)]/90 md:text-[var(--auth-text-on-maroon)]/90 text-center md:text-left mt-2 max-w-sm mx-auto md:mx-0",
  ctaStack: "mt-8 flex flex-col gap-3 w-full max-w-sm mx-auto md:mx-0",
  primaryCta:
    "w-full rounded-xl h-12 bg-[var(--auth-panel-maroon)] md:bg-[var(--auth-button)] text-white hover:opacity-95 active:scale-[0.99] md:hover:bg-[var(--auth-button-hover)] focus-visible:ring-2 focus-visible:ring-[var(--auth-button)]/50 transition-[transform,opacity,colors] duration-200 font-medium text-base shadow-sm",
  secondaryCta:
    "w-full rounded-xl h-12 border-2 border-[var(--auth-panel-maroon)] md:border-white/55 bg-transparent text-[var(--auth-panel-maroon)] md:text-white hover:bg-[var(--auth-panel-maroon)]/8 md:hover:bg-white/10 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[var(--auth-button)]/50 transition-[transform,colors,background-color] duration-200 font-medium text-base",
} as const;

/**
 * Primeira tela da auth: escolha clara entre criar conta (onboarding) e entrar (login).
 */
export function AuthEntryPage() {
  return (
    <AuthLayout>
      <AuthCard
        beigeFirst
        panelBeigeContent={
          <AuthPromoPanel
            title="Bem-vinda à Woody"
            subtitle="Um ambiente acolhedor e seguro para você se conectar, aprender e pertencer — no seu ritmo, com clareza e respeito."
          />
        }
        panelMaroonContent={
          <div className="flex flex-col justify-center min-h-[200px] md:min-h-0 py-2">
            <h2 className={styles.panelTitle}>Começar ou entrar</h2>
            <p className={styles.panelLead}>
              Escolha criar uma conta nova ou acessar a sua se você já faz parte.
            </p>
            <div className={styles.ctaStack}>
              <Button asChild className={cn(styles.primaryCta)}>
                <Link to="/auth/onboarding/1">Criar conta</Link>
              </Button>
              <Link to="/auth/login" className={cn(styles.secondaryCta, "inline-flex items-center justify-center")}>
                Entrar
              </Link>
            </div>
          </div>
        }
      />
    </AuthLayout>
  );
}
