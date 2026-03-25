import { useMemo } from "react";
import { FeedLayout } from "../components/FeedLayout";
import { FeedTabs } from "../components/FeedTabs";
import { CreatePostCard } from "../components/CreatePostCard";
import { PostCard } from "../components/PostCard";
import { Pagination } from "../components/Pagination";
import { FeedSkeleton } from "../components/FeedSkeleton";
import { FeedEmptyState } from "../components/FeedEmptyState";
import { FeedErrorState } from "../components/FeedErrorState";
import { useFeed } from "../hooks/useFeed";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { woodyLayout, woodySection } from "@/lib/woody-ui";
import { getRecentPostsInUserCommunities, isUserMemberOfCommunity } from "@/domain/selectors";
import {
  COMMUNITIES_PAGE_VIEWER_ID,
  getSuggestedCommunitiesForUser,
  getTrendingCommunities,
} from "@/features/communities/lib/communitiesPageModel";
import { CommunitiesSection } from "@/features/communities/components/CommunitiesSection";
import { CommunityCarousel } from "@/features/communities/components/CommunityCarousel";
import { CommunityCard } from "@/features/communities/components/CommunityCard";

const CAROUSEL_ITEM = "min-w-[min(88vw,300px)] shrink-0 snap-start md:min-w-0";

export function FeedPage() {
  const viewerId = COMMUNITIES_PAGE_VIEWER_ID;
  const spotlightCommunities = useMemo(() => getTrendingCommunities(), []);
  const suggestedCommunities = useMemo(() => getSuggestedCommunitiesForUser(viewerId), [viewerId]);
  const postsFromMyCommunities = useMemo(
    () => getRecentPostsInUserCommunities(viewerId, 4),
    [viewerId]
  );

  const {
    posts,
    isLoading,
    isRefreshing,
    hasLoadedOnce,
    error,
    page,
    hasNextPage,
    hasPreviousPage,
    filter,
    setFilter,
    nextPage,
    previousPage,
    refetch,
  } = useFeed();

  const hasPosts = posts.length > 0;
  const hasBlockingError = !hasPosts && !!error;
  const hasInlineError = hasPosts && !!error;
  const showInitialLoading = isLoading && !hasLoadedOnce;

  return (
    <FeedLayout searchSourcePosts={posts}>
      <div
        className={cn(
          "flex flex-col flex-1 max-w-3xl mx-auto w-full",
          woodyLayout.pagePad,
          woodyLayout.stackGap
        )}
      >
        <FeedTabs activeFilter={filter} onFilterChange={setFilter} />

        <CommunitiesSection
          eyebrow="Explorar"
          title="Comunidades em destaque"
          description="Espaços moderados onde as conversas acontecem — entre para ver regras e participar."
          sectionId="feed-community-spotlight"
        >
          <CommunityCarousel ariaLabel="Comunidades em destaque na home">
            {spotlightCommunities.map((c) => (
              <div key={c.id} className={CAROUSEL_ITEM}>
                <CommunityCard
                  community={c}
                  isMember={isUserMemberOfCommunity(viewerId, c.id)}
                  className="h-full"
                />
              </div>
            ))}
          </CommunityCarousel>
        </CommunitiesSection>

        {postsFromMyCommunities.length > 0 ? (
          <CommunitiesSection
            eyebrow="Seus espaços"
            title="Posts das suas comunidades"
            description="Atividade recente nos grupos em que você já está — todo post continua ligado à sua comunidade de origem."
            sectionId="feed-my-communities-posts"
          >
            <ul className="space-y-4 list-none p-0 m-0 md:space-y-5">
              {postsFromMyCommunities.map((post) => (
                <li key={post.id}>
                  <PostCard
                    post={post}
                    onPin={(id) => console.log("Pin", id)}
                    onReport={(id) => console.log("Report", id)}
                  />
                </li>
              ))}
            </ul>
          </CommunitiesSection>
        ) : null}

        {suggestedCommunities.length > 0 ? (
          <CommunitiesSection
            eyebrow="Descubra"
            title="Sugestões para você"
            description="Comunidades que ainda não fazem parte do seu painel — boas para ampliar repertório com segurança."
            sectionId="feed-suggested-communities"
          >
            <CommunityCarousel ariaLabel="Sugestões de comunidades">
              {suggestedCommunities.map((c) => (
                <div key={c.id} className={CAROUSEL_ITEM}>
                  <CommunityCard community={c} isMember={false} className="h-full" />
                </div>
              ))}
            </CommunityCarousel>
          </CommunitiesSection>
        ) : null}

        <CreatePostCard />

        <div>
          <h2 className={cn(woodySection.title, "flex items-center gap-2")}>
            Discussões em alta
            <Flame className="size-5 text-[var(--woody-accent)] shrink-0" aria-hidden />
          </h2>
          <p className={woodySection.subtitle}>
            Tópicos do momento, reunindo várias comunidades — cada post mostra de onde veio.
          </p>
        </div>

        <section className="relative space-y-5 min-h-[280px]">
          {showInitialLoading && <FeedSkeleton count={3} />}

          {hasBlockingError && <FeedErrorState message={error?.message} onRetry={refetch} />}

          {!showInitialLoading && !error && !hasPosts && <FeedEmptyState />}

          {hasInlineError && (
            <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-900 dark:text-amber-200">
              Não foi possível atualizar o feed agora. Exibindo os posts já carregados.
            </div>
          )}

          {hasPosts && (
            <>
              <ul
                className={cn(
                  "space-y-5 list-none p-0 m-0 transition-[opacity,transform,filter] duration-200 ease-out",
                  isRefreshing && "opacity-60 translate-y-[2px] saturate-75"
                )}
                aria-busy={isRefreshing}
              >
                {posts.map((post) => (
                  <li key={post.id}>
                    <PostCard
                      post={post}
                      onPin={(id) => console.log("Pin", id)}
                      onReport={(id) => console.log("Report", id)}
                    />
                  </li>
                ))}
              </ul>
              <Pagination
                page={page}
                hasPreviousPage={hasPreviousPage}
                hasNextPage={hasNextPage}
                onPrevious={previousPage}
                onNext={nextPage}
              />
            </>
          )}

          {isRefreshing && hasPosts && (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20">
              <div className="h-10 rounded-xl bg-gradient-to-b from-[var(--woody-bg)]/70 to-transparent" />
            </div>
          )}
        </section>
      </div>
    </FeedLayout>
  );
}
