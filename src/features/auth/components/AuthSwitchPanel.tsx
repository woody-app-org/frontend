import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AuthMode } from "../types";

const styles = {
  title: "text-2xl md:text-3xl font-bold text-[var(--auth-text-on-beige)]",
  subtitle: "text-sm md:text-base text-[var(--auth-text-on-beige)]/90 mt-2",
  ctaWrap: "mt-6 space-y-2",
  ctaText: "text-sm text-[var(--auth-text-on-beige)]",
  btn: "rounded-xl h-10 px-5 bg-[var(--auth-button)] text-white hover:bg-[var(--auth-button-hover)] focus-visible:ring-2 focus-visible:ring-[var(--auth-ornament)]/50 transition-colors",
} as const;

export interface AuthSwitchPanelProps {
  mode: AuthMode;
  onSwitch: () => void;
  className?: string;
}

export function AuthSwitchPanel({ mode, onSwitch, className }: AuthSwitchPanelProps) {
  const isLogin = mode === "login";

  return (
    <div className={cn("flex flex-col relative", className)}>
      <span
        className="absolute top-0 left-0 text-[var(--auth-panel-maroon)]/20 font-bold text-6xl md:text-7xl select-none pointer-events-none leading-none"
        aria-hidden
      >
        W
      </span>
      <h2 className={styles.title}>
        {isLogin ? "Bem-vinda de volta!" : "Bem-vinda à Woody"}
      </h2>
      <p className={styles.subtitle}>
        {isLogin
          ? "Entre com suas credenciais ao lado →"
          : "Preencha suas informações ao lado para se cadastrar"}
      </p>
      <div className={styles.ctaWrap}>
        <p className={styles.ctaText}>
          {isLogin ? "Ainda não tem uma conta?" : "Já possui uma conta?"}
        </p>
        <Button
          type="button"
          onClick={onSwitch}
          className={styles.btn}
          aria-label={isLogin ? "Ir para cadastro" : "Ir para login"}
        >
          {isLogin ? "Criar conta" : "Logar"}
        </Button>
      </div>
    </div>
  );
}
