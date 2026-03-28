import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Compass, Sparkles } from "lucide-react";
import { useOnboardingDraftContext } from "../OnboardingContext";
import { useOnboardingNavigation } from "../hooks/useOnboardingNavigation";
import { getRecommendedCommunitiesForOnboarding } from "../lib/recommendCommunities";
import { mockPersistCommunityJoins } from "../services/onboardingActionsMock";
import { OnboardingCommunityToggleCard } from "../components/OnboardingCommunityToggleCard";
import { OnboardingStepHeader } from "../components/OnboardingStepHeader";
import { onboardingStyles } from "../uiTokens";

/**
 * Etapa 5 — comunidades sugeridas (join mock; futuro: API de membership).
 */
export function OnboardingStepCommunities() {
  const { draft, updateDraft } = useOnboardingDraftContext();
  const { goNext } = useOnboardingNavigation();
  const [isSyncing, setIsSyncing] = useState(false);

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

  const handleContinue = async () => {
    setIsSyncing(true);
    try {
      await mockPersistCommunityJoins([...joinedIds]);
      goNext();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div>
      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--auth-panel-beige)]/10 px-3 py-1 text-[11px] sm:text-xs font-medium text-[var(--auth-text-on-maroon)]/88 ring-1 ring-white/10">
        <Sparkles className="size-3.5 shrink-0" aria-hidden />
        Sugestões pensadas para você
      </div>

      <OnboardingStepHeader
        icon={Compass}
        title="Comunidades para entrar"
        lead="Combinamos estes espaços com o que você marcou. Toque para entrar ou sair — você ainda explora tudo depois no app."
        trustNote="Participar é sempre da sua escolha. Nada aqui é automático sem o seu toque."
      />

      {communities.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 rounded-2xl border border-white/12 bg-[var(--auth-panel-beige)]/[0.05] px-5 py-10 text-center"
          role="status"
        >
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--auth-panel-beige)]/10 text-[var(--auth-text-on-maroon)]/75">
            <Compass className="size-6" aria-hidden />
          </div>
          <p className="text-sm font-medium text-[var(--auth-text-on-maroon)]/90">Nada por aqui ainda</p>
          <p className="text-xs text-[var(--auth-text-on-maroon)]/65 max-w-sm leading-relaxed">
            Não encontramos sugestões neste mock. Avance para finalizar — em produção a API devolveria comunidades
            alinhadas aos seus interesses.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pb-1">
          {communities.map((c) => (
            <li key={c.id} className="min-w-0">
              <OnboardingCommunityToggleCard
                community={c}
                joined={joinedIds.has(c.id)}
                onToggle={() => toggle(c.id)}
                disabled={isSyncing}
              />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs text-[var(--auth-text-on-maroon)]/62 text-center sm:text-left leading-relaxed">
        {joinedIds.size > 0
          ? `${joinedIds.size} ${joinedIds.size === 1 ? "comunidade selecionada" : "comunidades selecionadas"}`
          : "Você pode entrar agora ou descobrir comunidades depois no menu."}
      </p>

      <div className={onboardingStyles.footerRow}>
        <span />
        <button
          type="button"
          onClick={() => void handleContinue()}
          disabled={isSyncing}
          className={onboardingStyles.primaryBtn}
          aria-busy={isSyncing}
        >
          {isSyncing ? "Salvando…" : "Continuar"}
        </button>
      </div>
    </div>
  );
}
