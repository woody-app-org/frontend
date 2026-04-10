import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PenLine } from "lucide-react";
import { FeedLayout } from "../components/FeedLayout";
import { FeedTabs } from "../components/FeedTabs";
import { PostCard } from "../components/PostCard";
import { Pagination } from "../components/Pagination";
import { FeedSkeleton } from "../components/FeedSkeleton";
import { FeedEmptyState } from "../components/FeedEmptyState";
import { FeedErrorState } from "../components/FeedErrorState";
import { FeedCommunityContextStrip } from "../components/FeedCommunityContextStrip";
import { useFeed } from "../hooks/useFeed";
import { Flame, Compass, UserRoundCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { woodyLayout, woodySection } from "@/lib/woody-ui";
import { Button } from "@/components/ui/button";
import type { FeedFilter } from "../types";
import { useCreatePostComposer } from "../context/CreatePostComposerContext";

const FEED_HEADLINES: Record<
  FeedFilter,
  { title: string; subtitle: string; icon: typeof Flame }
> = {
  trending: {
    title: "Em alta entre as comunidades",
    subtitle: "Publicações com mais conversa agora — sempre com contexto do grupo de origem.",
    icon: Flame,
  },
  forYou: {
    title: "Para você",
    subtitle: "Prioriza os grupos em que você participa e abre espaço para novas descobertas.",
    icon: Compass,
  },
  following: {
    title: "Das pessoas que você segue",
    subtitle: "Atualizações das perfis que você acompanha na plataforma.",
    icon: UserRoundCheck,
  },
};

/**
 * Conteúdo do feed renderizado **dentro** de `FeedLayout` (onde está o `CreatePostComposerProvider`).
 * Não usar `useCreatePostComposer` no componente pai `FeedPage` — o provider é ancestral dos filhos do layout, não da página.
 */
function FeedPageContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [postCreatedBanner, setPostCreatedBanner] = useState<string | null>(null);

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
    registerNewPostFromComposer,
    togglePostLike,
    isPostLikePending,
  } = useFeed();

  const { openCreatePostModal, registerFeedIngest } = useCreatePostComposer();

  useEffect(() => {
    registerFeedIngest(registerNewPostFromComposer);
    return () => registerFeedIngest(null);
  }, [registerFeedIngest, registerNewPostFromComposer]);

  useEffect(() => {
    const st = location.state as { createdPostTitle?: string } | null;
    if (!st?.createdPostTitle) return;
    const t = st.createdPostTitle.trim();
    const short = t.length > 56 ? `${t.slice(0, 53)}…` : t;
    setPostCreatedBanner(short ? `«${short}» foi publicada com sucesso.` : "Publicação criada com sucesso.");
    navigate(`${location.pathname}${location.search}`, { replace: true, state: {} });
  }, [location.pathname, location.search, location.state, navigate]);

  useEffect(() => {
    if (!postCreatedBanner) return;
    const timer = window.setTimeout(() => setPostCreatedBanner(null), 6000);
    return () => window.clearTimeout(timer);
  }, [postCreatedBanner]);

  const hasPosts = posts.length > 0;
  const hasBlockingError = !hasPosts && !!error;
  const hasInlineError = hasPosts && !!error;
  const showInitialLoading = isLoading && !hasLoadedOnce;
  const headline = FEED_HEADLINES[filter];
  const HeadlineIcon = headline.icon;

  const emptyState =
    filter === "following"
      ? {
          title: "Nenhuma publicação de quem você segue",
          description:
            "Siga mais perfis ou volte ao “Em alta” / “Para você”. Quem você acompanha ainda não tem publicações recentes na base.",
        }
      : undefined;

  return (
    <div
      className={cn(
        "flex flex-col flex-1 max-w-3xl mx-auto w-full",
        woodyLayout.pagePad,
        woodyLayout.stackGap
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-stretch md:justify-between md:gap-4">
        <FeedTabs activeFilter={filter} onFilterChange={setFilter} className="w-full min-w-0 md:max-w-lg" />
        <Button
          type="button"
          onClick={openCreatePostModal}
          className="hidden md:inline-flex h-11 shrink-0 rounded-xl gap-2 bg-[var(--woody-nav)] px-4 text-white shadow-sm hover:bg-[var(--woody-nav)]/90"
        >
          <PenLine className="size-4 shrink-0" aria-hidden />
          Nova publicação
        </Button>
      </div>

      {postCreatedBanner && (
        <div
          className="rounded-2xl border border-emerald-500/35 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-950 dark:text-emerald-100"
          role="status"
          aria-live="polite"
        >
          {postCreatedBanner}
        </div>
      )}

      <div>
        <h2 className={cn(woodySection.title, "flex items-center gap-2")}>
          {headline.title}
          <HeadlineIcon className="size-5 text-[var(--woody-accent)] shrink-0" aria-hidden />
        </h2>
        <p className={woodySection.subtitle}>{headline.subtitle}</p>
      </div>

      <section className="relative space-y-5 min-h-[280px]">
        {showInitialLoading && <FeedSkeleton count={3} />}

        {hasBlockingError && <FeedErrorState message={error?.message} onRetry={refetch} />}

        {!showInitialLoading && !error && !hasPosts && (
          <FeedEmptyState title={emptyState?.title} description={emptyState?.description} />
        )}

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
                    onLike={togglePostLike}
                    isLikePending={isPostLikePending(post.id)}
                    onPin={(id) => console.log("Pin", id)}
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

      <FeedCommunityContextStrip className="mt-2" />
    </div>
  );
}

export function FeedPage() {
  return (
    <FeedLayout>
      <FeedPageContent />
    </FeedLayout>
  );
}
