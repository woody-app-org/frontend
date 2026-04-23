import { useState, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Heart, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useOnboardingDraftContext } from "../OnboardingContext";
import { buildRegisterCredentialsFromDraft } from "../lib/buildOnboardingPayload";
import { persistOnboardingCommunityJoins } from "../services/onboardingCommunityJoins.service";
import { OnboardingStepHeader } from "../components/OnboardingStepHeader";
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
  const displayName = account?.username?.split(/[._-]/)[0] ?? account?.username ?? "";

  const handleFinish = useCallback(async () => {
    const credentials = buildRegisterCredentialsFromDraft(draft);
    if (!credentials) return;
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const communityIds = [...(draft.joinedCommunityIds ?? [])];
      await registerUser(credentials);
      if (communityIds.length > 0) {
        await persistOnboardingCommunityJoins(communityIds);
      }
      resetDraft();
      navigate("/feed", { replace: true });
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Não foi possível concluir o cadastro. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [draft, navigate, registerUser, resetDraft]);

  if (!account) {
    return <Navigate to="/auth/onboarding/1" replace />;
  }

  if (!draft.emailVerified) {
    return <Navigate to="/auth/onboarding/2" replace />;
  }

  return (
    <div className="text-center sm:text-left">
      <div className="mx-auto mb-4 flex size-[3.75rem] items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--auth-button)]/35 to-[var(--auth-panel-beige)] text-[var(--auth-text-on-maroon)] ring-1 ring-black/10 sm:mx-0 motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-500">
        <Heart className="size-8 fill-[var(--auth-button)]/25" aria-hidden />
      </div>

      <OnboardingStepHeader
        title={`Seja muito bem-vinda, ${displayName}`}
        lead="A Woody é um espaço seguro para mulheres trocarem experiências, apoiarem umas às outras e crescerem com leveza. Aqui o respeito vem primeiro."
        trustNote="Seu perfil e suas escolhas continuam sob seu controle depois que você entrar."
        className="!mb-5 sm:!mb-6"
      />

      <div className="my-5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--auth-panel-beige)] px-3 py-1.5 text-xs font-medium text-[var(--auth-text-on-maroon)]/90 ring-1 ring-black/10">
          <Sparkles className="size-3.5" aria-hidden />
          Conta quase pronta
        </span>
        {draft.joinedCommunityIds && draft.joinedCommunityIds.length > 0 ? (
          <span className="inline-flex rounded-full bg-[var(--auth-button)]/18 px-3 py-1.5 text-xs font-medium text-[var(--auth-text-on-maroon)] ring-1 ring-[var(--auth-button)]/25">
            {draft.joinedCommunityIds.length}{" "}
            {draft.joinedCommunityIds.length === 1 ? "comunidade" : "comunidades"} para explorar
          </span>
        ) : null}
      </div>

      {errorMessage && (
        <p
          className="mb-4 text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2.5 border border-red-200 text-left"
          role="alert"
        >
          {errorMessage}
        </p>
      )}

      <div className="rounded-2xl border border-black/10 bg-[var(--auth-panel-beige)] px-4 py-5 sm:px-6 text-sm text-[var(--auth-text-on-maroon)]/84 leading-relaxed shadow-sm">
        Ao entrar, você verá o feed e poderá ajustar perfil, notificações e privacidade. As comunidades que
        escolheu são associadas à sua conta neste momento (entradas diretas nas públicas e pedidos nas privadas).
      </div>

      <div className={cn(onboardingStyles.footerRow, "mt-8 justify-center sm:justify-end border-t-0 pt-2")}>
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
