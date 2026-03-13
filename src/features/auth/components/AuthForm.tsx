import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { AuthInputField } from "./AuthInputField";
import { loginSchema, registerSchema } from "../lib/validation";
import type { LoginFormData, RegisterFormData } from "../lib/validation";
import type { AuthMode } from "../types";
import { cn } from "@/lib/utils";

const styles = {
  formTitle: "text-2xl md:text-3xl font-bold mb-6",
  form: "space-y-4",
  link: "text-sm text-white/85 hover:text-white underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-white/50 rounded",
  submitBtn:
    "w-full rounded-xl h-11 bg-[var(--auth-button)] text-white hover:bg-[var(--auth-button-hover)] focus-visible:ring-2 focus-visible:ring-[var(--auth-ornament)]/50 transition-colors disabled:opacity-50 disabled:pointer-events-none font-medium",
} as const;

export interface AuthFormProps {
  mode: AuthMode;
  onSubmitLogin: (data: LoginFormData) => Promise<void>;
  onSubmitRegister: (data: RegisterFormData) => Promise<void>;
  isSubmitting: boolean;
  errorMessage: string | null;
  className?: string;
}

export function AuthForm({
  mode,
  onSubmitLogin,
  onSubmitRegister,
  isSubmitting,
  errorMessage,
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
    <div className={cn("w-full max-w-sm mx-auto md:mx-0", className)}>
      <h2 className={styles.formTitle}>
        {isLogin ? "Login" : "Cadastro"}
      </h2>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {errorMessage && (
          <p
            className="text-sm text-red-200 bg-red-900/30 rounded-lg px-3 py-2"
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
          {isSubmitting ? "Aguarde..." : isLogin ? "Entrar" : "Criar"}
        </button>
      </form>
    </div>
  );
}
