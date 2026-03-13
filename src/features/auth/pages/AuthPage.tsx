import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { AuthCard } from "../components/AuthCard";
import { AuthForm } from "../components/AuthForm";
import { AuthSwitchPanel } from "../components/AuthSwitchPanel";
import { useAuth } from "../context/AuthContext";
import type { AuthMode } from "../types";
import type { LoginFormData, RegisterFormData } from "../lib/validation";

function getInitialMode(pathname: string): AuthMode {
  return pathname.endsWith("/register") ? "register" : "login";
}

export function AuthPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { login, register: doRegister } = useAuth();
  const [mode, setMode] = useState<AuthMode>(() => getInitialMode(pathname));

  useEffect(() => {
    setMode(getInitialMode(pathname));
  }, [pathname]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmitLogin = useCallback(
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

  const handleSubmitRegister = useCallback(
    async (data: RegisterFormData) => {
      setErrorMessage(null);
      setIsSubmitting(true);
      try {
        await doRegister(data);
        navigate("/feed", { replace: true });
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Erro ao cadastrar. Tente novamente."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [doRegister, navigate]
  );

  const handleSwitchMode = useCallback(() => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setErrorMessage(null);
  }, []);

  const isLogin = mode === "login";

  return (
    <AuthLayout>
      <AuthCard
        beigeFirst={isLogin}
        panelBeigeContent={
          isLogin ? (
            <AuthSwitchPanel mode="login" onSwitch={handleSwitchMode} />
          ) : (
            <AuthSwitchPanel mode="register" onSwitch={handleSwitchMode} />
          )
        }
        panelMaroonContent={
          <AuthForm
            mode={mode}
            onSubmitLogin={handleSubmitLogin}
            onSubmitRegister={handleSubmitRegister}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
          />
        }
      />
    </AuthLayout>
  );
}
