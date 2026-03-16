import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { AuthInputField } from "./AuthInputField";
import { loginSchema, registerSchema } from "../lib/validation";
import type { LoginFormData, RegisterFormData } from "../lib/validation";
import type { AuthMode } from "../types";
import { cn } from "@/lib/utils";

const styles = {
  formTitle: "text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center md:text-left",
  form: "space-y-4",
  link:
    "text-sm text-[var(--auth-text-on-beige)] md:text-white/85 hover:underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--auth-button)]/50 md:focus-visible:ring-white/50 rounded",
  submitBtn:
    "w-full rounded-xl h-11 md:h-11 bg-[var(--auth-panel-maroon)] md:bg-[var(--auth-button)] text-white hover:opacity-95 md:hover:bg-[var(--auth-button-hover)] focus-visible:ring-2 focus-visible:ring-[var(--auth-button)]/50 transition-colors disabled:opacity-50 disabled:pointer-events-none font-medium touch-manipulation",
  switchMobile:
    "mt-6 pt-6 border-t border-[var(--woody-accent)]/20 md:border-0 md:pt-0 md:mt-0 block md:hidden text-center",
  switchMobileText: "text-sm text-[var(--auth-text-on-beige)] md:text-white",
  switchMobileBtn:
    "text-sm font-medium text-[var(--auth-panel-maroon)] md:text-white underline underline-offset-2 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--auth-button)]/50 rounded mt-1 inline-block",
} as const;

export interface AuthFormProps {
  mode: AuthMode;
  onSubmitLogin: (data: LoginFormData) => Promise<void>;
  onSubmitRegister: (data: RegisterFormData) => Promise<void>;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSwitchMode?: () => void;
  className?: string;
}

export function AuthForm({
  mode,
  onSubmitLogin,
  onSubmitRegister,
  isSubmitting,
  errorMessage,
  onSwitchMode,
  className,
}: AuthFormProps) {
  const isLogin = mode === "login";

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const form = isLogin ? loginForm : registerForm;

  const handleSubmit = form.handleSubmit(async (data) => {
    if (isLogin) {
      await onSubmitLogin(data as LoginFormData);
    } else {
      await onSubmitRegister(data as RegisterFormData);
    }
  });

  return (
    <div className={cn("w-full max-w-sm mx-auto md:mx-0 px-0", className)}>
      <h2 className={styles.formTitle}>
        {isLogin ? "Login" : "Criar Conta"}
      </h2>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {errorMessage && (
          <p
            className="text-sm text-red-600 md:text-red-200 bg-red-100 md:bg-red-900/30 rounded-lg px-3 py-2"
            role="alert"
          >
            {errorMessage}
          </p>
        )}

        {isLogin ? (
          <>
            <AuthInputField
              label="Usuário"
              placeholder="Usuário ou e-mail"
              type="text"
              autoComplete="username"
              variant="maroon"
              {...loginForm.register("username")}
              error={loginForm.formState.errors.username?.message}
            />
            <div className="flex flex-col">
              <AuthInputField
                label="Senha"
                placeholder="Senha"
                type="password"
                autoComplete="current-password"
                variant="maroon"
                {...loginForm.register("password")}
                error={loginForm.formState.errors.password?.message}
              />
              <Link
                to="/auth"
                className={cn(styles.link, "self-end mt-1")}
              >
                Esqueci minha senha
              </Link>
            </div>
          </>
        ) : (
          <>
            <AuthInputField
              label="Usuário"
              placeholder="Nome de usuário"
              type="text"
              autoComplete="username"
              variant="maroon"
              {...registerForm.register("username")}
              error={registerForm.formState.errors.username?.message}
            />
            <AuthInputField
              label="E-mail"
              placeholder="seu@email.com"
              type="email"
              autoComplete="email"
              variant="maroon"
              {...registerForm.register("email")}
              error={registerForm.formState.errors.email?.message}
            />
            <AuthInputField
              label="Senha"
              placeholder="Mínimo 6 caracteres"
              type="password"
              autoComplete="new-password"
              variant="maroon"
              {...registerForm.register("password")}
              error={registerForm.formState.errors.password?.message}
            />
            <AuthInputField
              label="Confirmar senha"
              placeholder="Repita a senha"
              type="password"
              autoComplete="new-password"
              variant="maroon"
              {...registerForm.register("confirmPassword")}
              error={registerForm.formState.errors.confirmPassword?.message}
            />
          </>
        )}

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? "Aguarde..." : isLogin ? "Entrar" : "Criar Conta"}
        </button>

        {onSwitchMode && (
          <div className={styles.switchMobile}>
            <p className={styles.switchMobileText}>
              {isLogin ? "Ainda não tem conta?" : "Já possui uma conta?"}
            </p>
            <button
              type="button"
              onClick={onSwitchMode}
              className={styles.switchMobileBtn}
              aria-label={isLogin ? "Ir para cadastro" : "Ir para login"}
            >
              {isLogin ? "Criar Conta" : "Logar"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
