import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Compass, Sparkles } from "lucide-react";
import type { Community } from "@/domain/types";
import { useOnboardingDraftContext } from "../OnboardingContext";
import { useOnboardingNavigation } from "../hooks/useOnboardingNavigation";
import { fetchOnboardingCommunitySuggestions } from "../services/onboardingCommunity.service";
import { OnboardingCommunityToggleCard } from "../components/OnboardingCommunityToggleCard";
import { OnboardingStepHeader } from "../components/OnboardingStepHeader";
import { onboardingStyles } from "../uiTokens";

type LoadState = { status: "loading" } | { status: "ok"; communities: Community[] } | { status: "error" };

/**
 * Etapa 5 — comunidades sugeridas a partir de `GET /communities` e interesses do draft.
 * As entradas são gravadas na API só após o registo (etapa 6), quando existe JWT.
 */
export function OnboardingStepCommunities() {
  const { draft, updateDraft } = useOnboardingDraftContext();
  const { goNext } = useOnboardingNavigation();
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });

  const joinedIds = new Set(draft.joinedCommunityIds ?? []);
  const interestsKey = (draft.interestIds ?? []).slice().sort().join(",");

  useEffect(() => {
    let cancelled = false;
    const interestIds = draft.interestIds ?? [];
    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoadState({ status: "loading" });
      try {
        const communities = await fetchOnboardingCommunitySuggestions(interestIds, 8);
        if (!cancelled) setLoadState({ status: "ok", communities });
      } catch {
        if (!cancelled) setLoadState({ status: "error" });
      }
    })();
    return () => {
      cancelled = true;
    };
    // interestsKey serializa draft.interestIds (evita re-fetch só por nova referência de array).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interestsKey]);

  if (!draft.account) {
    return <Navigate to="/auth/onboarding/1" replace />;
  }

  const toggle = (id: string) => {
    const next = new Set(joinedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    updateDraft({ joinedCommunityIds: [...next] });
  };

  const communities = loadState.status === "ok" ? loadState.communities : [];

  return (
    <div>
      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--auth-button)]/12 px-3 py-1 text-[11px] sm:text-xs font-medium text-[var(--auth-text-on-maroon)]/88 ring-1 ring-[var(--auth-button)]/25">
        <Sparkles className="size-3.5 shrink-0" aria-hidden />
        Sugestões pensadas para você
      </div>

      <OnboardingStepHeader
        icon={Compass}
        title="Comunidades para entrar"
        lead="Combinamos estes espaços com o que você marcou e com as comunidades reais da Woody. Toque para escolher — ao concluir o cadastro, entramos por você nas públicas e pedimos acesso nas privadas."
        trustNote="Participar é sempre da sua escolha. Nada aqui é automático sem o seu toque."
      />

      {loadState.status === "loading" ? (
        <p
          className="rounded-2xl border border-black/12 bg-[var(--auth-panel-beige)] px-5 py-10 text-center text-sm text-[var(--auth-text-on-maroon)]/80"
          role="status"
        >
          A carregar comunidades…
        </p>
      ) : loadState.status === "error" ? (
        <div
          className="flex flex-col items-center gap-3 rounded-2xl border border-black/12 bg-[var(--auth-panel-beige)] px-5 py-10 text-center"
          role="alert"
        >
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--auth-button)]/12 text-[var(--auth-text-on-maroon)]/75">
            <Compass className="size-6" aria-hidden />
          </div>
          <p className="text-sm font-medium text-[var(--auth-text-on-maroon)]/90">Não foi possível carregar as comunidades</p>
          <p className="text-xs text-[var(--auth-text-on-maroon)]/65 max-w-sm leading-relaxed">
            Verifique a ligação à API e tente voltar a esta etapa. Pode continuar e explorar comunidades depois no
            menu.
          </p>
        </div>
      ) : communities.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 rounded-2xl border border-black/12 bg-[var(--auth-panel-beige)] px-5 py-10 text-center"
          role="status"
        >
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--auth-button)]/12 text-[var(--auth-text-on-maroon)]/75">
            <Compass className="size-6" aria-hidden />
          </div>
          <p className="text-sm font-medium text-[var(--auth-text-on-maroon)]/90">Nenhuma comunidade na base ainda</p>
          <p className="text-xs text-[var(--auth-text-on-maroon)]/65 max-w-sm leading-relaxed">
            Avance para finalizar — quando houver grupos na plataforma, eles aparecerão aqui ou na lista completa de
            comunidades.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pb-1">
          {communities.map((c) => (
            <li key={c.id} className="min-w-0">
              <OnboardingCommunityToggleCard community={c} joined={joinedIds.has(c.id)} onToggle={() => toggle(c.id)} />
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
        <button type="button" onClick={() => goNext()} className={onboardingStyles.primaryBtn}>
          Continuar
        </button>
      </div>
    </div>
  );
}
