import { HeartHandshake, Sparkles } from "lucide-react";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import { CommunityCard } from "../components/CommunityCard";
import { CommunitiesSection } from "../components/CommunitiesSection";
import { CommunityCarousel } from "../components/CommunityCarousel";
import { CommunitiesEmptyState } from "../components/CommunitiesEmptyState";
import {
  COMMUNITIES_PAGE_VIEWER_ID,
  getCommunitiesGroupedByCategory,
  getMyCommunities,
  getSuggestedCommunitiesForUser,
  getTrendingCommunities,
} from "../lib/communitiesPageModel";

const carouselItemMobile = "min-w-[min(88vw,340px)] shrink-0 snap-start md:min-w-0";

export function CommunitiesPage() {
  const viewerId = COMMUNITIES_PAGE_VIEWER_ID;
  const trending = getTrendingCommunities();
  const myCommunities = getMyCommunities(viewerId);
  const forYou = getSuggestedCommunitiesForUser(viewerId);
  const categoryGroups = getCommunitiesGroupedByCategory();

  const memberIds = new Set(myCommunities.map((c) => c.id));

  return (
    <FeedLayout>
      <div className="mx-auto w-full max-w-6xl px-3 py-5 md:px-6 md:py-7 pb-20 md:pb-8">
        <header className="relative mb-10 overflow-hidden rounded-2xl border border-[var(--woody-accent)]/20 bg-[var(--woody-card)] px-5 py-8 shadow-[0_1px_3px_rgba(92,58,59,0.06)] sm:px-8 sm:py-10 md:mb-12">
          <div
            className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-[var(--woody-nav)]/10 blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-24 left-1/3 size-48 rounded-full bg-[var(--woody-accent)]/15 blur-2xl"
            aria-hidden
          />
          <div className="relative flex flex-col gap-4 md:max-w-3xl">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--woody-nav)]/12 px-3 py-1 text-xs font-semibold text-[var(--woody-text)] ring-1 ring-[var(--woody-accent)]/15">
              <Sparkles className="size-3.5 text-[var(--woody-nav)]" aria-hidden />
              Pilar Woody
            </span>
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-[var(--woody-text)] sm:text-3xl md:text-[2rem]">
              Comunidades feitas para{" "}
              <span className="text-[var(--woody-nav)]">acolher conversas reais</span>
            </h1>
            <p className="text-sm leading-relaxed text-[var(--woody-muted)] sm:text-base md:max-w-2xl">
              Aqui você encontra grupos moderados, com propósito claro, para dividir experiências com
              outras mulheres com segurança — seja para carreira, bem-estar, cultura ou novos
              começos.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-sm text-[var(--woody-text)]/90">
              <span className="inline-flex items-center gap-2 rounded-xl bg-[var(--woody-bg)]/80 px-3 py-2 ring-1 ring-[var(--woody-accent)]/10">
                <HeartHandshake className="size-4 shrink-0 text-[var(--woody-accent)]" aria-hidden />
                Espaços com curadoria e respeito
              </span>
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-12 md:gap-14">
          <CommunitiesSection
            eyebrow="Em movimento"
            title="Comunidades em alta"
            description="Grupos com bastante troca agora — entre, leia e escolha onde quer participar."
            sectionId="section-trending"
          >
            <CommunityCarousel ariaLabel="Comunidades em alta">
              {trending.map((c) => (
                <div key={c.id} className={carouselItemMobile}>
                  <CommunityCard community={c} isMember={memberIds.has(c.id)} className="h-full" />
                </div>
              ))}
            </CommunityCarousel>
          </CommunitiesSection>

          <CommunitiesSection
            eyebrow="Sua jornada"
            title="Minhas comunidades"
            description="Os espaços nos quais você já faz parte — acesso rápido ao que importa para você."
            sectionId="section-mine"
          >
            {myCommunities.length === 0 ? (
              <CommunitiesEmptyState
                title="Você ainda não entrou em nenhuma comunidade"
                description="Explore os destaques acima ou uma categoria abaixo e escolha o primeiro grupo para acompanhar."
                icon={HeartHandshake}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
                {myCommunities.map((c) => (
                  <CommunityCard key={c.id} community={c} isMember className="h-full" />
                ))}
              </div>
            )}
          </CommunitiesSection>

          <CommunitiesSection
            eyebrow="Descubra"
            title="Para você"
            description="Sugestões além do seu círculo atual — ideal para ampliar horizontes com calma."
            sectionId="section-foryou"
          >
            {forYou.length === 0 ? (
              <CommunitiesEmptyState
                title="Você já está em todas as comunidades disponíveis"
                description="Quando novos espaços abrirem, eles aparecerão aqui. Por enquanto, aproveite as conversas nos grupos que você já faz parte."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
                {forYou.map((c) => (
                  <CommunityCard key={c.id} community={c} isMember={false} className="h-full" />
                ))}
              </div>
            )}
          </CommunitiesSection>

          {categoryGroups.map((group) => (
            <CommunitiesSection
              key={group.category}
              sectionId={`section-cat-${group.category}`}
              eyebrow="Explorar"
              title={group.label}
              description="Filtre por temas que fazem sentido para o seu momento — cada comunidade tem regras e moderação próprias."
            >
              <CommunityCarousel ariaLabel={`Comunidades na categoria ${group.label}`}>
                {group.communities.map((c) => (
                  <div key={c.id} className={carouselItemMobile}>
                    <CommunityCard community={c} isMember={memberIds.has(c.id)} className="h-full" />
                  </div>
                ))}
              </CommunityCarousel>
            </CommunitiesSection>
          ))}
        </div>
      </div>
    </FeedLayout>
  );
}
