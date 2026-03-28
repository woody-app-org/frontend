import { useState, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Heart, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useOnboardingDraftContext } from "../OnboardingContext";
import { onboardingStyles } from "../uiTokens";
import { cn } from "@/lib/utils";

/**
 * Etapa 6 — boas-vindas e conclusão (register mock + limpeza do draft).
 */
export function OnboardingStepComplete() {
  const { draft, resetDraft } = useOnboardingDraftContext();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const account = draft.account;

  const handleFinish = useCallback(async () => {
    if (!account) return;
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await registerUser({
        username: account.username,
        email: account.email,
        password: account.password,
        cpf: account.cpf,
        birthDate: account.birthDate,
        avatarUrl: draft.profilePhotoDataUrl ?? undefined,
      });
      resetDraft();
      navigate("/feed", { replace: true });
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Não foi possível concluir o cadastro. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [account, draft.profilePhotoDataUrl, navigate, registerUser, resetDraft]);

  if (!account) {
    return <Navigate to="/auth/onboarding/1" replace />;
  }

  return (
    <div className="text-center sm:text-left">
      <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--auth-button)]/35 to-[var(--auth-panel-beige)]/15 text-[var(--auth-text-on-maroon)] sm:mx-0">
        <Heart className="size-8 fill-[var(--auth-button)]/30" aria-hidden />
      </div>

      <h1 className={cn(onboardingStyles.stepTitle, "text-2xl md:text-3xl")}>
        Seja muito bem-vinda, {account.username.split(" ")[0] ?? account.username}
      </h1>
      <p className={onboardingStyles.stepLead}>
        A Woody é um espaço seguro para mulheres trocarem experiências, apoiarem umas às outras e crescerem com
        leveza. Aqui o respeito vem primeiro — e você faz parte disso.
      </p>

      <div className="my-6 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--auth-panel-beige)]/12 px-3 py-1.5 text-xs font-medium text-[var(--auth-text-on-maroon)]/90">
          <Sparkles className="size-3.5" aria-hidden />
          Conta quase pronta
        </span>
        {draft.joinedCommunityIds && draft.joinedCommunityIds.length > 0 ? (
          <span className="inline-flex rounded-full bg-[var(--auth-button)]/20 px-3 py-1.5 text-xs font-medium text-[var(--auth-text-on-maroon)]">
            {draft.joinedCommunityIds.length}{" "}
            {draft.joinedCommunityIds.length === 1 ? "comunidade" : "comunidades"} para explorar
          </span>
        ) : null}
      </div>

      {errorMessage && (
        <p className="mb-4 text-sm text-red-200 bg-red-900/35 rounded-xl px-3 py-2.5 border border-red-400/20 text-left" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="rounded-2xl border border-white/12 bg-[var(--auth-panel-beige)]/[0.07] px-4 py-5 sm:px-6 text-sm text-[var(--auth-text-on-maroon)]/85 leading-relaxed">
        Ao entrar, você verá o feed e poderá ajustar perfil, notificações e privacidade quando quiser. Tudo isso
        poderá ser sincronizado com o backend na próxima fase do produto.
      </div>

      <div className={cn(onboardingStyles.footerRow, "mt-8 justify-center sm:justify-end")}>
        <button
          type="button"
          onClick={handleFinish}
          disabled={isSubmitting}
          className={cn(
            onboardingStyles.primaryBtn,
            "w-full sm:w-auto min-w-[200px] inline-flex items-center justify-center gap-2 h-12 text-base"
          )}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden />
              Entrando...
            </>
          ) : (
            "Entrar na Woody"
          )}
        </button>
      </div>
    </div>
  );
}
