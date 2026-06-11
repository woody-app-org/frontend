import { memo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MessageCircle, MessageCircleOff, Loader2, Lock, TrendingUp } from "lucide-react";
import { showErrorToast, showSuccessToast } from "@/lib/toast/woodyToast";
import {
  Card,
} from "@/components/ui/card";
import { StoryRing } from "@/components/ui/StoryRing";
import { cn } from "@/lib/utils";
import { woodyMotion, woodyPinPill } from "@/lib/woody-ui";
import type { Post } from "../types";
import { resolvePublicMediaUrl } from "@/lib/api";
import { legacyImageUrlsToPostMediaAttachments } from "@/domain/mediaAttachment";
import { useViewerId } from "@/features/auth/hooks/useViewerId";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { setPostCommentsEnabled } from "../services/postPin.service";
import { PostMediaGallery } from "@/components/media/PostMediaGallery";
import { PostCommunityContextBar } from "./PostCommunityContextBar";
import { PostProfileContextBar } from "./PostProfileContextBar";
import { PostOverflowMenu, type PostProfilePinMenuProps } from "./PostOverflowMenu";
import { ProBadge } from "@/features/subscription/components/ProBadge";
import { PostLikeIcon } from "./PostLikeIcon";
import { usePostLikeTapAnimation } from "../hooks/usePostLikeTapAnimation";
import { profilePathForUser } from "@/features/profile/lib/profilePaths";
import { postPathForPost, postCommentsFocusPath } from "@/features/feed/lib/postPaths";
import { PostShareButton } from "./share/PostShareButton";
import { buildPostDetailNavState } from "../lib/postDetailNavState";
import {
  isBackgroundNavigationSuppressed,
  isWoodyModalDialogOpen,
} from "@/lib/modalBackgroundNavSuppress";

// --- Helpers ---

function formatCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

// --- Estilos padronizados (evitar classes gigantes inline) ---

const styles = {
  card: cn(
    woodyMotion.postCardHover,
    "relative flex flex-col gap-0 overflow-hidden rounded-2xl border border-black/[0.08] bg-[var(--woody-card)]",
    "px-6 pt-5 pb-5 shadow-[0_2px_14px_rgba(10,10,10,0.045),0_8px_28px_rgba(10,10,10,0.03)]"
  ),
  header:
    "relative z-[1] flex flex-row items-start justify-between gap-3 p-0",
  headerLeft: "flex min-w-0 flex-1 items-start gap-3",
  avatar: "size-9 shrink-0 md:size-10",
  headerMeta: "min-w-0 flex-1",
  authorName: "font-semibold text-[var(--woody-text)] text-[0.98rem] leading-tight truncate md:text-[1.02rem]",
  authorPronouns: "text-[var(--woody-muted)] text-[0.75rem]",
  authorHandle: "text-[0.8125rem] leading-tight text-[var(--woody-muted)] truncate mt-0.5",
  postMeta:
    "text-[0.8125rem] leading-snug text-[var(--woody-muted)] mt-3 first:mt-0",
  menuTrigger:
    "shrink-0 touch-manipulation text-[var(--woody-text)] hover:bg-[var(--woody-nav)]/10 rounded-md p-2 min-h-11 min-w-11 sm:min-h-9 sm:min-w-9 sm:p-1.5",
  metaRow:
    "relative z-[1] mt-3.5 flex flex-wrap content-start items-start gap-x-2 gap-y-2 sm:items-center",
  pill:
    "inline-flex items-center rounded-full px-2.5 py-[0.1875rem] text-[0.75rem] font-semibold tracking-[0.01em] bg-[var(--woody-tag-bg)] text-[var(--woody-tag-text)] ring-1 ring-[rgba(139,195,74,0.28)]",
  content:
    "text-[var(--woody-text)]/92 text-[0.9375rem] leading-[1.45] whitespace-pre-wrap break-words",
  contentBlock: "relative z-[1] p-0 pt-1 pb-0",
  footer:
    "relative z-[1] flex items-center gap-24 mt-3 pt-0.5 text-[var(--woody-muted)]",
  footerItem:
    "flex items-center gap-1.5 text-xs transition-colors rounded-md py-1 px-1.5 -mx-1.5 hover:text-[var(--woody-text)] hover:bg-[var(--woody-nav)]/5 [&_svg]:size-3.5",
};

// --- Component ---

export interface PostCardProps {
  post: Post;
  /** Realça suavemente cartões na secção “Posts em destaque” do perfil. */
  profilePinHighlight?: boolean;
  profilePinMenu?: PostProfilePinMenuProps;
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
  /**
   * `profile`: no perfil da autora omitimos a faixa “Publicação no perfil” (redundante).
   * @default "feed"
   */
  postSurface?: "feed" | "community" | "profile";
  /** Ferramentas de staff na página da comunidade (impulsionar — gating premium no servidor). */
  communityBoost?: {
    communityId: string;
    canBoost: boolean;
    staffNeedsPremium: boolean;
    isBoosting?: boolean;
    onBoost?: () => void | Promise<void>;
  };
  /** Abre stories da autora quando `post.author.hasActiveStories`. */
  onViewAuthorStories?: (authorId: string) => void;
}

function PostCardInner({
  post,
  profilePinHighlight = false,
  profilePinMenu,
  onPin,
  onPostUpdated,
  onPostDeleted,
  onLike,
  isLikePending = false,
  className,
  postListingContext = "feed",
  postSurface = "feed",
  communityBoost,
  onViewAuthorStories,
}: PostCardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const viewerId = useViewerId();
  const currentUser = useCurrentUser();
  const isSuperAdmin = currentUser?.role === "SuperAdmin";
  const [commentsEnabled, setCommentsEnabled] = useState(post.commentsEnabled !== false);
  const [isTogglingComments, setIsTogglingComments] = useState(false);
  const ignoreNextCardClickRef = useRef(false);
  const { tapPhase, triggerTap } = usePostLikeTapAnimation();

  const handleToggleComments = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (isTogglingComments) return;
    const next = !commentsEnabled;
    setIsTogglingComments(true);
    try {
      await setPostCommentsEnabled(post.id, next);
      setCommentsEnabled(next);
      onPostUpdated?.({ ...post, commentsEnabled: next });
      showSuccessToast(next ? "Comentários ativados nesta publicação." : "Comentários desativados nesta publicação.");
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : "Não foi possível alterar os comentários.");
    } finally {
      setIsTogglingComments(false);
    }
  };

  const suppressNextCardOpenFromMenu = () => {
    ignoreNextCardClickRef.current = true;
  };
  const openPost = () => navigate(postPathForPost(post), { state: buildPostDetailNavState(location) });
  const openPostComments = () =>
    navigate(postCommentsFocusPath(post), { state: buildPostDetailNavState(location) });

  const imageGalleryRaw =
    post.imageUrls && post.imageUrls.length > 0
      ? post.imageUrls
      : post.imageUrl
        ? [post.imageUrl]
        : [];
  const imageGallery = imageGalleryRaw.map((u) => resolvePublicMediaUrl(u));

  const galleryItems =
    post.mediaAttachments && post.mediaAttachments.length > 0
      ? post.mediaAttachments
      : imageGallery.length > 0
        ? legacyImageUrlsToPostMediaAttachments(imageGallery)
        : null;

  // Classe de bleed: cancela o padding horizontal do card para que a mídia chegue às bordas.
  // A variante "profile" tem px-4/sm:px-5; community tem px-6/sm:px-7; default tem px-6.
  const mediaBleedClass =
    postSurface === "profile"
      ? "-mx-4 sm:-mx-5"
      : postListingContext === "community"
        ? "-mx-6 sm:-mx-7"
        : "-mx-6";

  const hasContextBar =
    Boolean(post.community) || (post.publicationContext === "profile" && postSurface !== "profile");
  const showProfileContext =
    post.publicationContext === "profile" && !post.community && postSurface !== "profile";

  // "Em destaque" fica no content (indicador de pin no perfil)
  const showMetaRow = Boolean(post.pinnedOnProfileAt && postSurface === "profile");
  // Tags e badge "Impulsionado" sobem para o header, logo abaixo do username
  const hasTags = (post.tags?.length ?? 0) > 0;
  const showBoostBadge = Boolean(post.communityBoostActive && post.publicationContext === "community");

  const handleCardClick = (event: React.MouseEvent<HTMLElement>) => {
    if (ignoreNextCardClickRef.current) {
      ignoreNextCardClickRef.current = false;
      return;
    }
    if (isBackgroundNavigationSuppressed() || isWoodyModalDialogOpen()) return;
    const target = event.target as HTMLElement;
    if (target.closest("a,button,[data-post-ignore-open='true']")) return;
    openPost();
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    // Conteúdo em portal (ex.: Editar publicação) propaga keydown na árvore React até ao Card;
    // não chamar preventDefault antes destes guardas — senão o espaço nunca chega ao input/textarea.
    if (isBackgroundNavigationSuppressed() || isWoodyModalDialogOpen()) return;

    const rawTarget = event.target;
    if (rawTarget instanceof HTMLElement) {
      const tag = rawTarget.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || rawTarget.isContentEditable) return;
      if (rawTarget.closest('[role="dialog"]') || rawTarget.closest('[data-slot="dialog-content"]')) return;
    }

    event.preventDefault();
    openPost();
  };

  return (
    <Card
      className={cn(
        styles.card,
        "cursor-pointer",
        postListingContext === "community" && "px-6 pb-5 pt-4 sm:px-7 sm:pb-6 sm:pt-5",
        postSurface === "profile" &&
          "border-l border-l-black/[0.06] px-4 py-4 shadow-[0_1px_8px_rgba(10,10,10,0.045)] sm:px-5",
        profilePinHighlight &&
          postSurface === "profile" &&
          "ring-1 ring-[var(--woody-accent)]/22 border-[var(--woody-accent)]/22",
        className
      )}
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      {post.community ? (
        <PostCommunityContextBar preview={post.community} variant={postListingContext} />
      ) : showProfileContext ? (
        <PostProfileContextBar
          authorId={post.author.id}
          authorUsername={post.author.username}
          authorDisplayName={post.author.name}
          variant={postListingContext}
        />
      ) : null}
      {/* Layout de duas colunas: avatar fixo à esquerda, todo conteúdo à direita */}
      <div className={cn("flex items-start gap-3", hasContextBar && "pt-1 sm:pt-2")}>
        {/* Coluna esquerda: avatar */}
        <div
          data-post-ignore-open="true"
          className="shrink-0"
          onClick={(event) => event.stopPropagation()}
        >
          <StoryRing
            avatarUrl={post.author.avatarUrl}
            displayName={post.author.username}
            hasActiveStories={post.author.hasActiveStories ?? false}
            size="md"
            onClick={
              post.author.hasActiveStories
                ? (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onViewAuthorStories?.(post.author.id);
                  }
                : undefined
            }
          />
        </div>

        {/* Coluna direita: username + conteúdo completo */}
        <div className="relative min-w-0 flex-1 pr-8">
          <div
            data-post-ignore-open="true"
            className="min-w-0"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
              <Link
                to={profilePathForUser(post.author)}
                className="inline-flex items-baseline gap-1 min-w-0 rounded-md hover:bg-[var(--woody-nav)]/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/30"
                aria-label={`Ver perfil de ${post.author.name}`}
              >
                <span className={styles.authorName}>{post.author.username}</span>
                {post.author.subscriptionBadge ? <ProBadge variant="inline" tier={post.author.subscriptionBadge} /> : null}
              </Link>
              <span className="text-[var(--woody-muted)] text-[0.8rem] leading-tight shrink-0">· {post.createdAt}</span>
            </div>
            {showBoostBadge ? (
              <div className="flex flex-wrap items-center gap-1 mt-1">
                <span
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--woody-nav)]/10 px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--woody-nav)] ring-1 ring-[var(--woody-nav)]/20"
                  title={post.communityBoostEndsAt ? `Até ${post.communityBoostEndsAt}` : "Impulsionado"}
                >
                  <TrendingUp className="size-3" aria-hidden />
                  Impulsionado
                </span>
              </div>
            ) : null}
          </div>

          {/* Conteúdo: destaque + texto + tags + mídia */}
          <div>
            {showMetaRow ? (
              <div className={styles.metaRow}>
                <span className={woodyPinPill} aria-label="Publicação em destaque no perfil">
                  Em destaque
                </span>
              </div>
            ) : null}
            <p className={cn(styles.content, showMetaRow && "mt-2")}>
              {post.content}
            </p>
            {hasTags ? (
              <div
                data-post-ignore-open="true"
                className="flex flex-wrap gap-1 mt-1"
                onClick={(e) => e.stopPropagation()}
              >
                {post.tags?.map((tag) => (
                  <span key={tag} className={styles.pill}>
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
            {galleryItems ? (
              <div
                data-post-ignore-open="true"
                className={cn("mt-4 sm:mt-5", mediaBleedClass)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <PostMediaGallery items={galleryItems} className="mt-0 sm:mt-1" />
              </div>
            ) : null}
          </div>

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
              if (!isLikePending && onLike) triggerTap(!post.likedByCurrentUser);
              void onLike?.(post.id);
            }}
          >
            {isLikePending ? (
              <Loader2 className="size-[1em] animate-spin" strokeWidth={2} />
            ) : (
              <PostLikeIcon liked={post.likedByCurrentUser} tapPhase={tapPhase} />
            )}
            {formatCount(post.likesCount)}
          </button>
          <button
            type="button"
            data-post-ignore-open="true"
            disabled={!commentsEnabled}
            className={cn(styles.footerItem, !commentsEnabled && "opacity-60 cursor-not-allowed")}
            aria-label={commentsEnabled ? "Abrir comentários da publicação" : "Comentários desativados nesta publicação"}
            title={commentsEnabled ? undefined : "Comentários desativados nesta publicação"}
            onClick={(event) => {
              event.stopPropagation();
              if (!commentsEnabled) return;
              openPostComments();
            }}
          >
            {commentsEnabled ? (
              <MessageCircle className="size-[1em] stroke-current" strokeWidth={1.75} />
            ) : (
              <MessageCircleOff className="size-[1em] stroke-current" strokeWidth={1.75} />
            )}
            {formatCount(post.commentsCount)}
          </button>
          {isSuperAdmin ? (
            <button
              type="button"
              data-post-ignore-open="true"
              disabled={isTogglingComments}
              className={cn(styles.footerItem, isTogglingComments && "opacity-70 cursor-not-allowed")}
              aria-label={commentsEnabled ? "Desativar comentários (SuperAdmin)" : "Ativar comentários (SuperAdmin)"}
              title={commentsEnabled ? "Desativar comentários (SuperAdmin)" : "Ativar comentários (SuperAdmin)"}
              onClick={handleToggleComments}
            >
              {isTogglingComments ? (
                <Loader2 className="size-[1em] animate-spin" strokeWidth={2} />
              ) : commentsEnabled ? (
                <MessageCircleOff className="size-[1em] stroke-current" strokeWidth={1.75} />
              ) : (
                <MessageCircle className="size-[1em] stroke-current" strokeWidth={1.75} />
              )}
            </button>
          ) : null}
          <PostShareButton post={post} variant="card" className={styles.footerItem} />
          {communityBoost ? (
            <button
              type="button"
              data-post-ignore-open="true"
              disabled={communityBoost.isBoosting || !communityBoost.canBoost}
              title={
                communityBoost.staffNeedsPremium
                  ? "Disponível com o plano premium desta comunidade."
                  : communityBoost.canBoost
                    ? "Impulsionar publicação nesta comunidade."
                    : undefined
              }
              className={cn(
                styles.footerItem,
                communityBoost.staffNeedsPremium && "text-[var(--woody-muted)]",
                communityBoost.canBoost && "text-[var(--woody-nav)]"
              )}
              aria-label={
                communityBoost.staffNeedsPremium
                  ? "Impulsionar — requer plano premium da comunidade"
                  : "Impulsionar publicação na comunidade"
              }
              onClick={(event) => {
                event.stopPropagation();
                if (communityBoost.canBoost && communityBoost.onBoost) void communityBoost.onBoost();
              }}
            >
              {communityBoost.isBoosting ? (
                <Loader2 className="size-[1em] animate-spin" strokeWidth={2} />
              ) : communityBoost.staffNeedsPremium ? (
                <Lock className="size-[1em] stroke-current" strokeWidth={1.75} />
              ) : (
                <TrendingUp className="size-[1em] stroke-current" strokeWidth={1.75} />
              )}
              <span className="hidden min-[380px]:inline">Impulsionar</span>
              <span className="min-[380px]:hidden">Boost</span>
            </button>
          ) : null}
          </div>
          {/* Menu absoluto no canto superior direito da coluna — alinha com username independente da context bar */}
          <div className="absolute top-0 right-0 z-10">
            <PostOverflowMenu
              post={post}
              viewerId={viewerId}
              profilePinMenu={profilePinMenu}
              onPin={profilePinMenu ? undefined : onPin}
              onPostUpdated={onPostUpdated}
              onPostDeleted={onPostDeleted}
              onBeforeMenuActionPointerDown={suppressNextCardOpenFromMenu}
              triggerClassName={styles.menuTrigger}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Memoizado: só re-renderiza quando as suas próprias props mudam.
 * Evita que curtir/comentar um post re-renderize todos os outros cards na lista.
 */
export const PostCard = memo(PostCardInner);
