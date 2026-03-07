import { PostCard } from "@/features/feed/components/PostCard";
import { FeedEmptyState } from "@/features/feed/components/FeedEmptyState";
import { FeedSkeleton } from "@/features/feed/components/FeedSkeleton";
import { Pagination } from "@/features/feed/components/Pagination";
import { cn } from "@/lib/utils";
import type { Post } from "@/features/feed/types";

const styles = {
  list: "space-y-5 list-none p-0 m-0",
};

export interface ProfilePostsSectionProps {
  posts: Post[];
  isLoading: boolean;
  page: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onPin?: (postId: string) => void;
  onReport?: (postId: string) => void;
  className?: string;
}

export function ProfilePostsSection({
  posts,
  isLoading,
  page,
  hasNextPage,
  hasPreviousPage,
  onPreviousPage,
  onNextPage,
  onPin,
  onReport,
  className,
}: ProfilePostsSectionProps) {
  if (isLoading) {
    return <FeedSkeleton count={3} className={className} />;
  }

  if (posts.length === 0) {
    return (
      <FeedEmptyState
        className={cn(className, "py-8")}
      />
    );
  }

  return (
    <section className={cn("space-y-5", className)}>
      <ul className={styles.list}>
        {posts.map((post) => (
          <li key={post.id}>
            <PostCard
              post={post}
              onPin={onPin}
              onReport={onReport}
            />
          </li>
        ))}
      </ul>
      <Pagination
        page={page}
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        onPrevious={onPreviousPage}
        onNext={onNextPage}
      />
    </section>
  );
}
