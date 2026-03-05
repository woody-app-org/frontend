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

  return (
    <FeedLayout activeFilter={filter} onFilterChange={setFilter}>
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

        <section className="space-y-5">
          {isLoading && <FeedSkeleton count={3} />}

          {!isLoading && error && (
            <FeedErrorState message={error.message} onRetry={refetch} />
          )}

          {!isLoading && !error && posts.length === 0 && (
            <FeedEmptyState />
          )}

          {!isLoading && !error && posts.length > 0 && (
            <>
              <ul className={cn("space-y-5 list-none p-0 m-0")}>
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
        </section>
      </div>
    </FeedLayout>
  );
}
