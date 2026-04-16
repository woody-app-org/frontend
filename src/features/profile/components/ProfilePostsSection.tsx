import { PostCard } from "@/features/feed/components/PostCard";
import { FeedEmptyState } from "@/features/feed/components/FeedEmptyState";
import { FeedSkeleton } from "@/features/feed/components/FeedSkeleton";
import { Pagination } from "@/features/feed/components/Pagination";
import { cn } from "@/lib/utils";
import { woodySection } from "@/lib/woody-ui";
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
  onPostUpdated?: (post: Post) => void;
  onPostDeleted?: (postId: string) => void;
  className?: string;
  /** Título da seção (bloco “Posts / Publicações”). */
  sectionTitle?: string;
  sectionDescription?: string;
  /** Esconde título e descrição (ex.: abas do perfil). */
  hideSectionHeader?: boolean;
}

const headerStyles = {
  wrap: "mb-4 md:mb-5",
  title: woodySection.title,
  desc: woodySection.subtitle,
} as const;

export function ProfilePostsSection({
  posts,
  isLoading,
  page,
  hasNextPage,
  hasPreviousPage,
  onPreviousPage,
  onNextPage,
  onPin,
  onPostUpdated,
  onPostDeleted,
  className,
  sectionTitle = "Publicações",
  sectionDescription = "No teu perfil e nas comunidades (só as que quem visita pode ver). Cada cartão indica se é publicação de perfil ou de grupo.",
  hideSectionHeader = false,
}: ProfilePostsSectionProps) {
  const header = hideSectionHeader ? null : (
    <div className={headerStyles.wrap}>
      <h2 className={headerStyles.title}>{sectionTitle}</h2>
      {sectionDescription ? <p className={headerStyles.desc}>{sectionDescription}</p> : null}
    </div>
  );

  if (isLoading) {
    return (
      <div className={className}>
        {header}
        <FeedSkeleton count={3} />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={className}>
        {header}
        <FeedEmptyState
          className="py-8"
          title="Sem publicações visíveis"
          description="Ainda não há posts no perfil, ou as publicações em comunidades privadas só aparecem para quem participa delas."
        />
      </div>
    );
  }

  return (
    <section className={cn("space-y-5", className)}>
      {header}
      <ul className={styles.list}>
        {posts.map((post) => (
          <li key={post.id}>
            <PostCard
              post={post}
              postSurface="profile"
              onPin={onPin}
              onPostUpdated={onPostUpdated}
              onPostDeleted={onPostDeleted}
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
