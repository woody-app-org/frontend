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

export function FeedPage() {
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
      <div className="flex flex-col flex-1 max-w-2xl mx-auto w-full px-3 md:px-6 py-4 md:py-5">
        <FeedTabs
          activeFilter={filter}
          onFilterChange={setFilter}
          className="mb-4"
        />

        <div className="hidden md:block mb-4">
          <h2 className="flex items-center gap-2 text-xl font-bold text-[var(--woody-text)]">
            Discussões em alta
            <Flame className="size-5 text-[var(--woody-accent)] shrink-0" />
          </h2>
        </div>

        <CreatePostCard className="mb-5" />

        <section className="relative space-y-5 min-h-[280px]">
          {showInitialLoading && <FeedSkeleton count={3} />}

          {hasBlockingError && <FeedErrorState message={error?.message} onRetry={refetch} />}

          {!showInitialLoading && !error && !hasPosts && (
            <FeedEmptyState />
          )}

          {hasInlineError && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
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
