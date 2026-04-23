import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
      "Ordenado por conversa (gostos e comentários) e relevância das comunidades — inclui posts públicos e de perfil visíveis na Woody.",
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

  const newPostBtnClass = cn(
    "inline-flex h-12 shrink-0 items-center justify-center gap-2.5 rounded-full border-2 border-[var(--woody-nav)] bg-black px-7 text-[0.9375rem] font-semibold tracking-[0.03em] text-[var(--woody-nav)]",
    "shadow-[0_0_0_1px_rgba(139,195,74,0.4),0_16px_52px_rgba(139,195,74,0.26),0_0_40px_rgba(139,195,74,0.1)]",
    "transition-[box-shadow,background-color,border-color,color] duration-200 hover:bg-[#050505] hover:shadow-[0_0_0_1px_rgba(139,195,74,0.5),0_18px_56px_rgba(139,195,74,0.3)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--woody-main-surface)]"
  );

  return (
    <div
      className={cn(
        "flex w-full max-w-none flex-col flex-1",
        /* Mobile: respiro lateral; desktop: largura vem do <main> — sem padding extra horizontal para alinhar com a coluna direita */
        "px-3 py-4 md:px-0 md:py-0",
        "gap-7 md:gap-8"
      )}
    >
      <section className="rounded-[1.5rem] border border-black/[0.06] bg-white px-5 py-7 shadow-[0_2px_12px_rgba(10,10,10,0.06)] md:px-8 md:py-9 lg:px-9 lg:py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-8 xl:gap-10">
          {/* Barra verde só à altura do bloco de texto (referência), nunca da linha inteira com o botão */}
          <div className="flex min-w-0 flex-1 items-stretch gap-4 sm:gap-5 md:gap-6">
            <div
              className="w-[3px] shrink-0 rounded-[1px] bg-[var(--woody-nav)] sm:w-1 lg:w-[5px]"
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-balance text-[1.75rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-[var(--woody-text)] sm:text-[2rem] md:text-[2.25rem] md:leading-[1.06] lg:max-w-[30rem] lg:text-[2.375rem] xl:max-w-[34rem]">
                Faça valer a pena: conecte-se!
              </h1>
              <p className="mt-4 max-w-[32rem] text-[0.9375rem] font-normal leading-relaxed text-[var(--woody-muted)] md:mt-5 md:text-base md:leading-relaxed">
                Encontre pessoas, ideias e comunidades com mais afinidade com o teu momento.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openCreatePostModal}
            className={cn(newPostBtnClass, "hidden w-full shrink-0 lg:inline-flex lg:w-auto")}
          >
            <PenLine className="size-5 shrink-0 text-[var(--woody-nav)]" strokeWidth={2.35} aria-hidden />
            Nova publicação
          </button>
        </div>
      </section>

      <div className="flex flex-col gap-4 md:gap-5">
        <div className="overflow-hidden rounded-[1.5rem] border border-black/[0.07] bg-[#ebebed] shadow-[0_1px_4px_rgba(10,10,10,0.05)]">
          <FeedTabs activeFilter={filter} onFilterChange={setFilter} className="w-full min-w-0 rounded-[inherit]" />
        </div>
        <div className="flex w-full shrink-0 justify-stretch lg:hidden">
          <button type="button" onClick={openCreatePostModal} className={cn(newPostBtnClass, "w-full")}>
            <PenLine className="size-5 shrink-0 text-[var(--woody-nav)]" strokeWidth={2.35} aria-hidden />
            Nova publicação
          </button>
        </div>
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

        {hasBlockingError && <FeedErrorState message={error?.message} onRetry={refetch} />}

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
