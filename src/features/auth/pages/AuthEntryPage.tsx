import { Link } from "react-router-dom";
import { LockKeyhole, LogIn, UserPlus } from "lucide-react";
import { AuthLayout } from "../components/AuthLayout";
import { AuthCard } from "../components/AuthCard";
import { AuthPromoPanel } from "../components/AuthPromoPanel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const styles = {
  panelTitle: "text-3xl font-bold text-[var(--auth-text-on-maroon)] text-center md:text-left tracking-tight",
  panelLead:
    "text-xl text-[var(--auth-text-on-maroon)]/80 text-center md:text-left mt-3 max-w-md mx-auto md:mx-0 leading-relaxed",
  ctaStack: "mt-8 flex flex-col gap-3 w-full max-w-sm mx-auto md:mx-0",
  primaryCta:
    "w-full rounded-xl h-12 bg-[var(--woody-ink)] text-[var(--auth-button)] hover:opacity-95 active:scale-[0.99] hover:bg-black focus-visible:ring-2 focus-visible:ring-[var(--auth-button)]/50 transition-[transform,opacity,colors,box-shadow] duration-200 font-semibold text-base shadow-[0_0_0_1px_rgba(139,195,74,0.3),0_0_18px_rgba(139,195,74,0.35)]",
  secondaryCta:
    "w-full rounded-xl h-12 border-2 border-black/40 bg-transparent text-[var(--auth-text-on-maroon)] hover:bg-black/[0.03] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[var(--auth-button)]/50 transition-[transform,colors,background-color] duration-200 font-semibold text-base",
  legal:
    "mt-6 flex items-start gap-2 text-xs text-[var(--auth-text-on-maroon)]/65 leading-relaxed max-w-sm mx-auto md:mx-0",
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
                <Link to="/auth/onboarding/1" className="inline-flex items-center justify-center gap-2">
                  <UserPlus className="size-4" aria-hidden />
                  Criar conta
                </Link>
              </Button>
              <Link to="/auth/login" className={cn(styles.secondaryCta, "inline-flex items-center justify-center")}>
                <LogIn className="mr-2 size-4" aria-hidden />
                Entrar
              </Link>
            </div>
            <p className={styles.legal}>
              <LockKeyhole className="mt-0.5 size-3.5 shrink-0 text-[var(--auth-button-hover)]" aria-hidden />
              Ao continuar, você concorda com os nossos Termos de Uso e Política de Privacidade.
            </p>
          </div>
        }
      />
    </AuthLayout>
  );
}
