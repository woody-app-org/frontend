import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { AuthInputField } from "./AuthInputField";
import { loginSchema } from "../lib/validation";
import type { LoginFormData } from "../lib/validation";
import { cn } from "@/lib/utils";

const styles = {
  formTitle: "text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center md:text-left",
  form: "space-y-4",
  link:
    "text-sm text-[var(--auth-text-on-beige)] md:text-white/85 hover:underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--auth-button)]/50 md:focus-visible:ring-white/50 rounded",
  submitBtn:
    "w-full rounded-xl h-11 md:h-11 bg-[var(--auth-panel-maroon)] md:bg-[var(--auth-button)] text-white hover:opacity-95 active:scale-[0.99] md:hover:bg-[var(--auth-button-hover)] focus-visible:ring-2 focus-visible:ring-[var(--auth-button)]/50 transition-[transform,opacity,colors] duration-200 disabled:opacity-50 disabled:pointer-events-none font-medium touch-manipulation",
  switchMobile:
    "mt-6 pt-6 border-t border-[var(--woody-accent)]/20 md:border-0 md:pt-0 md:mt-0 block md:hidden text-center",
  switchMobileText: "text-sm text-[var(--auth-text-on-beige)] md:text-white",
  switchMobileLink:
    "text-sm font-medium text-[var(--auth-panel-maroon)] md:text-white underline underline-offset-2 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--auth-button)]/50 rounded mt-1 inline-block transition-opacity duration-200",
} as const;

export interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isSubmitting: boolean;
  errorMessage: string | null;
  /** Rota para cadastro (footer só em mobile; no desktop o painel bege cobre isso) */
  createAccountTo?: string;
  className?: string;
}

export function LoginForm({
  onSubmit,
  isSubmitting,
  errorMessage,
  createAccountTo = "/auth/onboarding/1",
  className,
}: LoginFormProps) {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <div className={cn("w-full max-w-sm mx-auto md:mx-0 px-0", className)}>
      <h2 className={styles.formTitle}>Entrar</h2>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {errorMessage && (
          <p
            className="text-sm text-red-600 md:text-red-200 bg-red-100 md:bg-red-900/30 rounded-lg px-3 py-2"
            role="alert"
          >
            {errorMessage}
          </p>
        )}

        <AuthInputField
          label="Usuário"
          placeholder="Usuário ou e-mail"
          type="text"
          autoComplete="username"
          variant="maroon"
          {...form.register("username")}
          error={form.formState.errors.username?.message}
        />
        <div className="flex flex-col">
          <AuthInputField
            label="Senha"
            placeholder="Senha"
            type="password"
            autoComplete="current-password"
            variant="maroon"
            {...form.register("password")}
            error={form.formState.errors.password?.message}
          />
          <button
            type="button"
            className={cn(
              styles.link,
              "self-end mt-1 text-right bg-transparent border-none cursor-pointer font-inherit p-0 disabled:opacity-50"
            )}
            disabled={isSubmitting}
            title="Em breve"
          >
            Esqueci minha senha
          </button>
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? "Aguarde..." : "Entrar"}
        </button>

        <div className={styles.switchMobile}>
          <p className={styles.switchMobileText}>Ainda não tem conta?</p>
          <Link
            to={createAccountTo}
            className={styles.switchMobileLink}
            aria-label="Ir para criar conta"
          >
            Criar conta
          </Link>
        </div>
      </form>
    </div>
  );
}
