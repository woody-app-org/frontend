import { PostCard } from "@/features/feed/components/PostCard";
import { FeedEmptyState } from "@/features/feed/components/FeedEmptyState";
import { FeedSkeleton } from "@/features/feed/components/FeedSkeleton";
import { Pagination } from "@/features/feed/components/Pagination";
import { ProfileMediaGrid } from "./ProfileMediaGrid";
import { cn } from "@/lib/utils";
import { woodySection } from "@/lib/woody-ui";
import { canManageOwnPostProfilePin } from "@/domain/contentModerationPermissions";
import type { Post } from "@/features/feed/types";
import type { PostProfilePinMenuProps } from "@/features/feed/components/PostOverflowMenu";
import { useViewerId } from "@/features/auth/hooks/useViewerId";

const styles = {
  list: "space-y-4 list-none p-0 m-0",
} as const;

const featuredStyles = {
  wrap: "mb-5 rounded-2xl border border-[var(--woody-accent)]/14 bg-[var(--woody-card)]/86 p-3.5 shadow-[0_1px_8px_rgba(10,10,10,0.045)] sm:p-5",
  title: "text-sm font-semibold text-[var(--woody-text)] tracking-tight mb-2 sm:mb-3",
  subtitle: "text-xs leading-relaxed text-[var(--woody-muted)] mb-3 max-w-prose",
} as const;

export interface ProfilePostsSectionProps {
  pinnedPosts: Post[];
  posts: Post[];
  isLoading: boolean;
  page: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onPostUpdated?: (post: Post) => void;
  onPostDeleted?: (postId: string) => void;
  className?: string;
  /** Título do bloco de lista normal. */
  sectionTitle?: string;
  sectionDescription?: string;
  hideSectionHeader?: boolean;
  isOwnProfile: boolean;
  onToggleProfilePin: (post: Post) => void;
  pinningPostId: string | null;
  pinActionError: string | null;
  onDismissPinError: () => void;
  pinActionSuccess: string | null;
  onDismissPinSuccess: () => void;
  /** Curtir/descurtir na lista (sincroniza com `togglePostLikeMock`). */
  onLike?: (postId: string) => void | Promise<void>;
  isLikePending?: (postId: string) => boolean;
}

const headerStyles = {
  wrap: "mb-4 md:mb-5",
  title: woodySection.title,
  desc: woodySection.subtitle,
} as const;

export function ProfilePostsSection({
  pinnedPosts,
  posts,
  isLoading,
  page,
  hasNextPage,
  hasPreviousPage,
  onPreviousPage,
  onNextPage,
  onPostUpdated,
  onPostDeleted,
  className,
  sectionTitle = "Todas as publicações",
  sectionDescription,
  hideSectionHeader = false,
  isOwnProfile,
  onToggleProfilePin,
  pinningPostId,
  pinActionError,
  onDismissPinError,
  pinActionSuccess,
  onDismissPinSuccess,
  onLike,
  isLikePending,
}: ProfilePostsSectionProps) {
  const viewerId = useViewerId();

  const resolvedListDescription =
    sectionDescription ??
    (isOwnProfile
      ? "Ordem cronológica. As que fixaste aparecem em destaque acima."
      : "Publicações no perfil e em comunidades que podes ver.");

  const profilePinMenuFor = (post: Post): PostProfilePinMenuProps | undefined => {
    if (!canManageOwnPostProfilePin(viewerId, post, { viewingOwnProfile: isOwnProfile })) return undefined;
    return {
      isPinned: Boolean(post.pinnedOnProfileAt),
      busy: pinningPostId === post.id,
      onToggle: () => onToggleProfilePin(post),
    };
  };

  const listHeader = hideSectionHeader ? null : (
    <div className={headerStyles.wrap}>
      <h2 className={headerStyles.title}>{sectionTitle}</h2>
      {resolvedListDescription ? <p className={headerStyles.desc}>{resolvedListDescription}</p> : null}
    </div>
  );

  const allPostsForMedia = [...pinnedPosts, ...posts];

  const mediaGridBlock =
    allPostsForMedia.some(
      (p) =>
        (p.mediaAttachments?.length ?? 0) > 0 ||
        (p.imageUrls?.length ?? 0) > 0 ||
        Boolean(p.imageUrl)
    ) ? (
      <div className="rounded-2xl border border-black/[0.07] bg-[var(--woody-card)] p-4 shadow-[0_1px_8px_rgba(10,10,10,0.04)] sm:p-5">
        <ProfileMediaGrid posts={allPostsForMedia} />
      </div>
    ) : null;

  const featuredBlock =
    pinnedPosts.length > 0 ? (
      <div className={featuredStyles.wrap}>
        <h3 className={featuredStyles.title}>Posts em destaque</h3>
        <p className={featuredStyles.subtitle}>
          {isOwnProfile
            ? "Escolheste estas publicações para aparecerem primeiro no teu perfil."
            : "A autora destacou estas publicações no topo do perfil."}
        </p>
        <ul className={styles.list}>
          {pinnedPosts.map((post) => (
            <li key={post.id}>
              <PostCard
                post={post}
                postSurface="profile"
                profilePinHighlight
                profilePinMenu={profilePinMenuFor(post)}
                onPostUpdated={onPostUpdated}
                onPostDeleted={onPostDeleted}
                onLike={onLike}
                isLikePending={isLikePending?.(post.id) ?? false}
              />
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  if (isLoading) {
    return (
      <div className={className}>
        {listHeader}
        <FeedSkeleton count={3} />
      </div>
    );
  }

  if (pinnedPosts.length === 0 && posts.length === 0) {
    return (
      <div className={className}>
        {listHeader}
        <FeedEmptyState
          className="py-8"
          title="Sem publicações visíveis"
          description="Ainda não há posts no perfil, ou as publicações em comunidades privadas só aparecem para quem participa delas."
        />
      </div>
    );
  }

  const showListBlock = posts.length > 0 || hasNextPage || hasPreviousPage;

  return (
    <section className={cn("space-y-4", className)}>
      {pinActionSuccess ? (
        <div
          role="status"
          className="flex flex-col gap-2 rounded-lg border border-emerald-700/20 bg-emerald-700/8 px-3 py-2.5 text-sm text-[var(--woody-text)] sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{pinActionSuccess}</span>
          <button
            type="button"
            className="shrink-0 text-xs font-medium text-emerald-800/90 hover:underline dark:text-emerald-200/90"
            onClick={onDismissPinSuccess}
          >
            Fechar
          </button>
        </div>
      ) : null}
      {pinActionError ? (
        <div
          role="alert"
          className="flex flex-col gap-2 rounded-lg border border-[var(--woody-accent)]/25 bg-[var(--woody-accent)]/6 px-3 py-2.5 text-sm text-[var(--woody-text)] sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{pinActionError}</span>
          <button
            type="button"
            className="shrink-0 text-xs font-medium text-[var(--woody-accent)] hover:underline"
            onClick={onDismissPinError}
          >
            Fechar
          </button>
        </div>
      ) : null}

      {mediaGridBlock}

      {featuredBlock}

      {showListBlock ? (
        <div className="space-y-4">
          {!hideSectionHeader ? (
            <div className={headerStyles.wrap}>
              <h2 className={headerStyles.title}>{sectionTitle}</h2>
              {resolvedListDescription ? <p className={headerStyles.desc}>{resolvedListDescription}</p> : null}
            </div>
          ) : null}
          {posts.length > 0 ? (
            <ul className={styles.list}>
              {posts.map((post) => (
                <li key={post.id}>
                  <PostCard
                    post={post}
                    postSurface="profile"
                    profilePinMenu={profilePinMenuFor(post)}
                    onPostUpdated={onPostUpdated}
                    onPostDeleted={onPostDeleted}
                    onLike={onLike}
                    isLikePending={isLikePending?.(post.id) ?? false}
                  />
                </li>
              ))}
            </ul>
          ) : null}
          {hasNextPage || hasPreviousPage ? (
            <Pagination
              page={page}
              hasPreviousPage={hasPreviousPage}
              hasNextPage={hasNextPage}
              onPrevious={onPreviousPage}
              onNext={onNextPage}
            />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
