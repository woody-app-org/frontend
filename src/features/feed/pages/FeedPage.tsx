import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FeedLayout } from "../components/FeedLayout";
import { FeedTabs } from "../components/FeedTabs";
import { PostCard } from "../components/PostCard";
import { FeedSkeleton } from "../components/FeedSkeleton";
import { InfiniteScrollSentinel } from "../components/InfiniteScrollSentinel";
import { FeedEmptyState } from "../components/FeedEmptyState";
import { FeedErrorState } from "../components/FeedErrorState";
import { FeedCommunityContextStrip } from "../components/FeedCommunityContextStrip";
import { useFeed } from "../hooks/useFeed";
import { Flame, Compass, UserRoundCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { FeedFilter } from "../types";
import { useCreatePostComposer } from "../context/CreatePostComposerContext";
import { useAuth } from "@/features/auth/context/AuthContext";

const linkClass = "font-semibold text-[var(--woody-nav)] underline-offset-2 hover:underline";

const FEED_HEADLINES: Record<
  FeedFilter,
  { title: string; subtitle: string; icon: typeof Flame }
> = {
  trending: {
    title: "Em destaque",
    subtitle:
      "Uma curadoria de posts que estão criando conexão, conversa e movimento nas comunidades.",
    icon: Flame,
  },
  forYou: {
    title: "Para você",
    subtitle:
      "Mistura exploratória: comunidades públicas, contas que segues e grupos dos quais participas — a ordem vem do servidor, diferente de “Em destaque”.",
    icon: Compass,
  },
  following: {
    title: "Seguindo",
    subtitle:
      "Só posts de pessoas que segues ou de comunidades em que és membra — o mais recente primeiro.",
    icon: UserRoundCheck,
  },
};

function feedEmptyState(filter: FeedFilter, isAuthenticated: boolean): { title: string; description: ReactNode } {
  if (filter === "following" && !isAuthenticated) {
    return {
      title: "Inicia sessão para ver Seguindo",
      description: (
        <>
          Este feed mostra conteúdo das contas que segues e das comunidades em que participas.{" "}
          <Link to="/auth/login" className={linkClass}>
            Iniciar sessão
          </Link>
        </>
      ),
    };
  }
  if (filter === "following") {
    return {
      title: "Ainda não há nada no Seguindo",
      description: (
        <>
          Segue pessoas ou entra em comunidades — o feed é montado no servidor a partir dessas ligações.{" "}
          <Link to="/communities" className={linkClass}>
            Explorar comunidades
          </Link>
        </>
      ),
    };
  }
  if (filter === "forYou") {
    return {
      title: "O teu “Para você” está vazio",
      description: (
        <>
          Quando existir conteúdo público ou ligado à tua conta, aparece aqui com uma ordem própria (exploratória).{" "}
          <Link to="/communities" className={linkClass}>
            Ver comunidades
          </Link>
        </>
      ),
    };
  }
  return {
    title: "Nada em destaque por agora",
    description: (
      <>
        O feed “Em destaque” junta o que tem mais interação entre o que podes ver (perfil e comunidades públicas, ou
        privadas onde participas).{" "}
        <Link to="/communities" className={linkClass}>
          Explorar comunidades
        </Link>
      </>
    ),
  };
}

/**
 * Conteúdo do feed renderizado **dentro** de `FeedLayout` (onde está o `CreatePostComposerProvider`).
 * Não usar `useCreatePostComposer` no componente pai `FeedPage` — o provider é ancestral dos filhos do layout, não da página.
 */
function FeedPageContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [postCreatedBanner, setPostCreatedBanner] = useState<string | null>(null);

  const {
    posts,
    isLoading,
    isLoadingMore,
    isRefreshing,
    hasLoadedOnce,
    error,
    loadMoreError,
    hasNextPage,
    filter,
    setFilter,
    refreshFeed,
    loadMore,
    registerNewPostFromComposer,
    togglePostLike,
    isPostLikePending,
  } = useFeed();

  const { registerFeedIngest } = useCreatePostComposer();

  useEffect(() => {
    registerFeedIngest(registerNewPostFromComposer);
    return () => registerFeedIngest(null);
  }, [registerFeedIngest, registerNewPostFromComposer]);

  useEffect(() => {
    const st = location.state as { createdPostTitle?: string } | null;
    if (!st?.createdPostTitle) return;
    const t = st.createdPostTitle.trim();
    const short = t.length > 56 ? `${t.slice(0, 53)}…` : t;
    const path = `${location.pathname}${location.search}`;
    void (async () => {
      await Promise.resolve();
      setPostCreatedBanner(short ? `«${short}» foi publicada com sucesso.` : "Publicação criada com sucesso.");
      navigate(path, { replace: true, state: {} });
    })();
  }, [location.pathname, location.search, location.state, navigate]);

  useEffect(() => {
    if (!postCreatedBanner) return;
    const timer = window.setTimeout(() => setPostCreatedBanner(null), 6000);
    return () => window.clearTimeout(timer);
  }, [postCreatedBanner]);

  const hasPosts = posts.length > 0;
  const hasBlockingError = !hasPosts && !!error;
  const hasInlineError = hasPosts && !!error;
  /** Primeira visita ou troca de tab (lista limpa): skeleton em vez de lista antiga. */
  const showInitialLoading = isLoading && (!hasLoadedOnce || !hasPosts);
  const headline = FEED_HEADLINES[filter];
  const HeadlineIcon = headline.icon;

  const emptyState = useMemo(() => feedEmptyState(filter, isAuthenticated), [filter, isAuthenticated]);

  return (
    <div
      className={cn(
        "flex w-full max-w-none flex-col flex-1",
        /* Mobile: respiro lateral; desktop: largura vem do <main> — sem padding extra horizontal para alinhar com a coluna direita */
        "px-3 py-4 md:px-0 md:py-0",
        "gap-7 md:gap-8"
      )}
    >
      <div className="overflow-hidden rounded-[1.5rem] border border-black/[0.07] bg-[#ebebed] shadow-[0_1px_4px_rgba(10,10,10,0.05)]">
        <FeedTabs activeFilter={filter} onFilterChange={setFilter} className="w-full min-w-0 rounded-[inherit]" />
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

      <div className="pt-1">
        <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--woody-text)] md:text-[1.25rem]">
          {headline.title}
          <HeadlineIcon className="size-[1.125rem] text-[var(--woody-nav)] shrink-0 md:size-5" aria-hidden />
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--woody-muted)] md:text-[0.9375rem] md:leading-relaxed">
          {headline.subtitle}
        </p>
      </div>

      <section className="relative space-y-6 min-h-[280px]">
        {showInitialLoading && <FeedSkeleton count={3} />}

        {hasBlockingError && <FeedErrorState message={error?.message} onRetry={() => void refreshFeed()} />}

        {!showInitialLoading && !error && !hasPosts && (
          <FeedEmptyState title={emptyState.title} description={emptyState.description} />
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
                "space-y-6 list-none p-0 m-0 transition-[opacity,transform,filter] duration-200 ease-out",
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

            {loadMoreError && (
              <div
                className="flex flex-col items-center gap-3 rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-4 text-center sm:flex-row sm:justify-center"
                role="alert"
              >
                <p className="text-sm text-amber-900 dark:text-amber-200">{loadMoreError.message}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-[var(--woody-nav)]/35 shrink-0"
                  onClick={() => void loadMore()}
                >
                  Tentar novamente
                </Button>
              </div>
            )}

            {isLoadingMore && (
              <div className="pt-2" aria-live="polite" aria-busy="true">
                <div className="rounded-xl border border-black/[0.06] bg-white/90 px-4 py-3 shadow-[0_1px_6px_rgba(10,10,10,0.04)]">
                  <Skeleton className="h-3 w-3/5 max-w-[14rem] bg-[var(--woody-nav)]/12" />
                  <Skeleton className="mt-2.5 h-3 w-2/5 max-w-[10rem] bg-[var(--woody-nav)]/10" />
                </div>
              </div>
            )}

            {hasNextPage && !loadMoreError && (
              <InfiniteScrollSentinel
                onIntersect={() => void loadMore()}
                enabled={!isLoadingMore && !isLoading && !isRefreshing}
              />
            )}

            {!hasNextPage && !loadMoreError && (
              <p className="py-6 text-center text-sm text-[var(--woody-muted)]">Você chegou ao fim.</p>
            )}
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
