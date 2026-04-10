import { Link, useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Clock, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { woodyMotion, woodySurface } from "@/lib/woody-ui";
import type { Post } from "../types";
import { useViewerId } from "@/features/auth/hooks/useViewerId";
import { PostCommunityContextBar } from "./PostCommunityContextBar";
import { PostOverflowMenu } from "./PostOverflowMenu";

// --- Helpers ---

function formatCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

// --- Estilos padronizados (evitar classes gigantes inline) ---

const styles = {
  card: cn(
    woodySurface.card,
    woodyMotion.postCardHover,
    "flex flex-col gap-0 px-4 pt-3 pb-3 sm:px-4 overflow-hidden"
  ),
  header:
    "flex flex-row items-start justify-between gap-3 p-0",
  headerLeft: "flex min-w-0 flex-1 items-start gap-3",
  avatar: "size-9 shrink-0",
  headerMeta: "min-w-0 flex-1",
  authorName: "font-semibold text-[var(--woody-text)] text-[0.95rem] leading-tight truncate",
  authorPronouns: "text-[var(--woody-muted)] text-xs",
  timestamp: "flex items-center gap-1 text-[var(--woody-muted)] text-xs mt-0.5",
  menuTrigger:
    "shrink-0 touch-manipulation text-[var(--woody-text)] hover:bg-[var(--woody-nav)]/10 rounded-md p-2 min-h-11 min-w-11 sm:min-h-9 sm:min-w-9 sm:p-1.5",
  titleRow:
    "flex flex-wrap items-center gap-2 gap-y-1 mt-2",
  title: "font-bold text-[var(--woody-text)] text-base sm:text-[1.05rem] leading-snug",
  pill:
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[var(--woody-nav)]/15 text-[var(--woody-muted)] border border-[var(--woody-accent)]/10",
  content:
    "text-[var(--woody-text)]/90 text-[0.9375rem] leading-relaxed whitespace-pre-wrap break-words",
  contentBlock: "p-0 pt-2 pb-0",
  imageWrap: "mt-3 w-full overflow-hidden rounded-xl bg-[var(--woody-nav)]/5",
  image: "w-full object-cover max-h-72 rounded-xl",
  footer:
    "flex items-center gap-5 mt-3 pt-0.5 text-[var(--woody-muted)]",
  footerItem:
    "flex items-center gap-1.5 text-xs transition-colors rounded-md py-1 px-1.5 -mx-1.5 hover:text-[var(--woody-text)] hover:bg-[var(--woody-nav)]/5 [&_svg]:size-3.5",
};

// --- Component ---

export interface PostCardProps {
  post: Post;
  onPin?: (postId: string) => void;
  /** Sincroniza lista local (ex.: perfil) após edição mock. */
  onPostUpdated?: (post: Post) => void;
  onPostDeleted?: (postId: string) => void;
  onLike?: (postId: string) => void | Promise<void>;
  isLikePending?: boolean;
  className?: string;
  /**
   * `community`: chip da comunidade como indicador (sem link), adequado à página da própria comunidade.
   * @default "feed"
   */
  postListingContext?: "feed" | "community";
}

export function PostCard({
  post,
  onPin,
  onPostUpdated,
  onPostDeleted,
  onLike,
  isLikePending = false,
  className,
  postListingContext = "feed",
}: PostCardProps) {
  const navigate = useNavigate();
  const viewerId = useViewerId();
  const initials = post.author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const openPost = () => navigate(`/posts/${post.id}`);
  const openPostComments = () => navigate(`/posts/${post.id}?focus=comments`);

  const imageGallery =
    post.imageUrls && post.imageUrls.length > 0
      ? post.imageUrls
      : post.imageUrl
        ? [post.imageUrl]
        : [];

  const handleCardClick = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("a,button,[data-post-ignore-open='true']")) return;
    openPost();
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openPost();
  };

  return (
    <Card
      className={cn(
        styles.card,
        "cursor-pointer",
        postListingContext === "community" && "px-4 pb-4 pt-3 sm:px-6 sm:pb-5 sm:pt-4",
        className
      )}
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      {post.community ? (
        <PostCommunityContextBar preview={post.community} variant={postListingContext} />
      ) : null}
      <CardHeader className={cn(styles.header, post.community && "pt-2 sm:pt-3")}>
        <div className={styles.headerLeft}>
          <Link
            to={`/profile/${post.author.id}`}
            data-post-ignore-open="true"
            className="flex min-w-0 flex-1 items-start gap-3 rounded-md -m-1.5 p-1.5 hover:bg-[var(--woody-nav)]/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/30"
            aria-label={`Ver perfil de ${post.author.name}`}
            onClick={(event) => event.stopPropagation()}
          >
            <Avatar size="default" className={styles.avatar}>
              <AvatarImage src={post.author.avatarUrl ?? undefined} alt={post.author.name} />
              <AvatarFallback className="bg-[var(--woody-nav)]/10 text-[var(--woody-text)] text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className={styles.headerMeta}>
              <div className="flex flex-wrap items-baseline gap-1">
                <span className={styles.authorName}>{post.author.name}</span>
                {post.author.pronouns && (
                  <>
                    <span className={styles.authorPronouns}>•</span>
                    <span className={cn(styles.authorPronouns, "truncate")}>
                      {post.author.pronouns}
                    </span>
                  </>
                )}
              </div>
              <div className={styles.timestamp}>
                <Clock className="size-3 shrink-0" aria-hidden />
                <span>
                  {post.createdAt}
                  <span className="text-[var(--woody-muted)]/80"> · #{post.id}</span>
                </span>
              </div>
            </div>
          </Link>
        </div>
        <PostOverflowMenu
          post={post}
          viewerId={viewerId}
          onPin={onPin}
          onPostUpdated={onPostUpdated}
          onPostDeleted={onPostDeleted}
          triggerClassName={styles.menuTrigger}
        />
      </CardHeader>
      <CardContent className={styles.contentBlock}>
        <div className={styles.titleRow}>
          {post.title && <h3 className={styles.title}>{post.title}</h3>}
          {post.tags?.map((tag) => (
            <span key={tag} className={styles.pill}>
              {tag}
            </span>
          ))}
        </div>
        <p className={cn(styles.content, (post.title || post.tags?.length) && "mt-2")}>
          {post.content}
        </p>
        {imageGallery.length === 1 ? (
          <div className={styles.imageWrap}>
            <img src={imageGallery[0]} alt="" className={styles.image} />
          </div>
        ) : imageGallery.length > 1 ? (
          <div
            className="mt-3 flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory [-webkit-overflow-scrolling:touch]"
            data-post-ignore-open="true"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="list"
            aria-label="Imagens da publicação"
          >
            {imageGallery.map((src, idx) => (
              <div
                key={`${idx}-${src.slice(0, 48)}`}
                role="listitem"
                className={cn(styles.imageWrap, "min-w-[min(100%,280px)] shrink-0 snap-center max-w-[85vw]")}
              >
                <img src={src} alt="" className={styles.image} />
              </div>
            ))}
          </div>
        ) : null}
        <div className={styles.footer}>
          <button
            type="button"
            data-post-ignore-open="true"
            disabled={isLikePending}
            className={cn(
              styles.footerItem,
              post.likedByCurrentUser && "text-[var(--woody-accent)] bg-[var(--woody-accent)]/8",
              isLikePending && "opacity-70 cursor-not-allowed"
            )}
            aria-label={post.likedByCurrentUser ? "Descurtir publicação" : "Curtir publicação"}
            aria-pressed={post.likedByCurrentUser}
            onClick={(event) => {
              event.stopPropagation();
              void onLike?.(post.id);
            }}
          >
            {isLikePending ? (
              <Loader2 className="size-[1em] animate-spin" strokeWidth={2} />
            ) : (
              <Heart
                className={cn("size-[1em] stroke-current", post.likedByCurrentUser && "fill-current")}
                strokeWidth={1.75}
              />
            )}
            {formatCount(post.likesCount)}
          </button>
          <button
            type="button"
            data-post-ignore-open="true"
            className={styles.footerItem}
            aria-label="Abrir comentários da publicação"
            onClick={(event) => {
              event.stopPropagation();
              openPostComments();
            }}
          >
            <MessageCircle className="size-[1em] stroke-current" strokeWidth={1.75} />
            {formatCount(post.commentsCount)}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
