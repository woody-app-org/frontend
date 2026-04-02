import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { AuthCard } from "../components/AuthCard";
import { AuthPromoPanel } from "../components/AuthPromoPanel";
import { LoginForm } from "../components/LoginForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import type { LoginFormData } from "../lib/validation";

/**
 * Login isolado do onboarding — mesma lógica mockada de `login` do contexto.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (data: LoginFormData) => {
      setErrorMessage(null);
      setIsSubmitting(true);
      try {
        await login(data);
        navigate("/feed", { replace: true });
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Erro ao entrar. Tente novamente."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [login, navigate]
  );

  return (
    <AuthLayout>
      <AuthCard
        beigeFirst
        panelBeigeContent={
          <AuthPromoPanel
            title="Bem-vinda de volta!"
            subtitle="Entre com seus dados para continuar de onde parou."
            footer={
              <>
                <p className="text-sm text-[var(--auth-text-on-beige)]">Primeira vez por aqui?</p>
                <Button
                  asChild
                  className="rounded-xl h-10 px-5 bg-[var(--auth-button)] text-white hover:bg-[var(--auth-button-hover)] focus-visible:ring-2 focus-visible:ring-[var(--auth-ornament)]/50 transition-[transform,colors] duration-200 active:scale-[0.99] w-fit"
                >
                  <Link to="/auth/onboarding/1">Criar conta</Link>
                </Button>
              </>
            }
          />
        }
        panelMaroonContent={
          <LoginForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
          />
        }
      />
    </AuthLayout>
  );
}
