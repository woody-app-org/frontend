import { useMemo } from "react";
import { Navigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useOnboardingDraftContext } from "../OnboardingContext";
import { useOnboardingNavigation } from "../hooks/useOnboardingNavigation";
import { getRecommendedCommunitiesForOnboarding } from "../lib/recommendCommunities";
import { OnboardingCommunityToggleCard } from "../components/OnboardingCommunityToggleCard";
import { onboardingStyles } from "../uiTokens";

/**
 * Etapa 5 — comunidades sugeridas (join mock; futuro: API de membership).
 */
export function OnboardingStepCommunities() {
  const { draft, updateDraft } = useOnboardingDraftContext();
  const { goNext } = useOnboardingNavigation();

  const joinedIds = new Set(draft.joinedCommunityIds ?? []);

  const communities = useMemo(() => {
    const ids = draft.interestIds ?? [];
    return getRecommendedCommunitiesForOnboarding(ids, 8);
  }, [draft.interestIds]);

  if (!draft.account) {
    return <Navigate to="/auth/onboarding/1" replace />;
  }

  const toggle = (id: string) => {
    const next = new Set(joinedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    updateDraft({ joinedCommunityIds: [...next] });
  };

  return (
    <div>
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--auth-panel-beige)]/10 px-3 py-1 text-xs font-medium text-[var(--auth-text-on-maroon)]/85">
        <Sparkles className="size-3.5" aria-hidden />
        Sugestões pensadas para você
      </div>
      <h1 className={onboardingStyles.stepTitle}>Comunidades para entrar</h1>
      <p className={onboardingStyles.stepLead}>
        Estas comunidades combinam com o que você marcou. Toque para entrar ou sair — tudo fica salvo neste
        rascunho até você concluir.
      </p>

      {communities.length === 0 ? (
        <p className="rounded-xl border border-white/15 bg-[var(--auth-panel-beige)]/[0.06] px-4 py-6 text-center text-sm text-[var(--auth-text-on-maroon)]/75">
          Não encontramos sugestões no mock. Avance para finalizar — em produção isso viria da API.
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {communities.map((c) => (
            <li key={c.id}>
              <OnboardingCommunityToggleCard
                community={c}
                joined={joinedIds.has(c.id)}
                onToggle={() => toggle(c.id)}
              />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs text-[var(--auth-text-on-maroon)]/65 text-center sm:text-left">
        {joinedIds.size > 0
          ? `${joinedIds.size} ${joinedIds.size === 1 ? "comunidade selecionada" : "comunidades selecionadas"}`
          : "Você pode entrar nas comunidades agora ou explorar depois."}
      </p>

      <div className={onboardingStyles.footerRow}>
        <span />
        <button type="button" onClick={goNext} className={onboardingStyles.primaryBtn}>
          Continuar
        </button>
      </div>
    </div>
  );
}
