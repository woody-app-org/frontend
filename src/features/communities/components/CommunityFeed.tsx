import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { woodyFocus, woodySurface } from "@/lib/woody-ui";
import type { Community, CommunityPremiumCapabilities, Post } from "@/domain/types";
import { PostCard } from "@/features/feed/components/PostCard";
import { Pagination } from "@/features/feed/components/Pagination";
import { CommunitiesEmptyState } from "./CommunitiesEmptyState";
import { Button } from "@/components/ui/button";
import { Lock, MessageCircle } from "lucide-react";
import type { MyCommunityJoinRequestMeStatus } from "../services/communityMembership.service";

const DEFAULT_PAGE_SIZE = 10;

export interface CommunityFeedPrivateGuestLockProps {
  isAuthenticated: boolean;
  joinStatus: MyCommunityJoinRequestMeStatus;
  onRequestJoin: () => void | Promise<void>;
  onCancelJoin?: () => void | Promise<void>;
  ctaBusy?: boolean;
  /** Ex.: `/communities/slug-da-comunidade` para voltar após login. */
  loginReturnTo: string;
}

export interface CommunityFeedProps {
  community: Community;
  posts: Post[];
  className?: string;
  /** Total de posts da comunidade (para decidir se mostra paginação). */
  totalPostCount?: number;
  postsPerPage?: number;
  page?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  /** Sem lista de posts por política de acesso (ex. comunidade privada). */
  feedAccessRestricted?: boolean;
  /**
   * Comunidade privada, visitante sem acesso ao feed — painel dedicado (não parece erro).
   * Só é usado quando `posts.length === 0`.
   */
  privateGuestLock?: CommunityFeedPrivateGuestLockProps | null;
  premiumCapabilities?: CommunityPremiumCapabilities;
  onBoostPost?: (postId: string) => void | Promise<void>;
  boostingPostId?: string | null;
  onLike?: (postId: string) => void | Promise<void>;
  isLikePending?: (postId: string) => boolean;
}

function PrivateCommunityGuestPanel({
  community,
  lock,
}: {
  community: Community;
  lock: CommunityFeedPrivateGuestLockProps;
}) {
  const { isAuthenticated, joinStatus, onRequestJoin, onCancelJoin, ctaBusy, loginReturnTo } = lock;
  const loginHref = `/auth/login?returnTo=${encodeURIComponent(loginReturnTo)}`;

  const primary =
    !isAuthenticated ? (
      <Button asChild size="lg" className={cn(woodyFocus.ring, "w-full min-w-0 sm:w-auto sm:min-w-[14rem]")}>
        <Link to={loginHref}>Iniciar sessão para solicitar</Link>
      </Button>
    ) : joinStatus === "pending" ? (
      <Button
        type="button"
        size="lg"
        variant="secondary"
        disabled
        className={cn(woodyFocus.ring, "w-full min-w-0 cursor-default sm:w-auto sm:min-w-[14rem]")}
      >
        Solicitação enviada
      </Button>
    ) : joinStatus === "rejected" ? (
      <Button
        type="button"
        size="lg"
        className={cn(woodyFocus.ring, "w-full min-w-0 sm:w-auto sm:min-w-[14rem]")}
        disabled={ctaBusy}
        onClick={() => void onRequestJoin()}
      >
        {ctaBusy ? "Aguarde…" : "Solicitar novamente"}
      </Button>
    ) : (
      <Button
        type="button"
        size="lg"
        className={cn(woodyFocus.ring, "w-full min-w-0 sm:w-auto sm:min-w-[14rem]")}
        disabled={ctaBusy}
        onClick={() => void onRequestJoin()}
      >
        {ctaBusy ? "Aguarde…" : "Solicitar entrada"}
      </Button>
    );

  return (
    <div
      className={cn(
        woodySurface.card,
        "flex flex-col items-center gap-5 px-6 py-12 text-center sm:px-10 sm:py-14",
        "border border-[var(--woody-accent)]/12 shadow-[0_10px_40px_rgba(10,10,10,0.06)]"
      )}
    >
      <div
        className="flex size-14 items-center justify-center rounded-2xl bg-[var(--woody-nav)]/10 text-[var(--woody-nav)] sm:size-16"
        aria-hidden
      >
        <Lock className="size-7 sm:size-8" strokeWidth={1.6} />
      </div>
      <div className="max-w-md space-y-2">
        <h3 className="text-lg font-bold text-[var(--woody-text)] sm:text-xl">Comunidade privada</h3>
        <p className="text-sm leading-relaxed text-[var(--woody-muted)] sm:text-[0.9375rem]">
          Solicita entrada para ver posts, conversas e participantes em{" "}
          <span className="font-medium text-[var(--woody-text)]/90">{community.name}</span>.
        </p>
      </div>
      <div className="flex w-full max-w-md flex-col items-center gap-3">{primary}</div>
      {isAuthenticated && joinStatus === "pending" && onCancelJoin ? (
        <button
          type="button"
          className={cn(
            woodyFocus.ring,
            "text-sm font-medium text-[var(--woody-muted)] underline decoration-[var(--woody-accent)]/25 underline-offset-4",
            "hover:text-[var(--woody-text)] disabled:pointer-events-none disabled:opacity-50"
          )}
          disabled={ctaBusy}
          onClick={() => void onCancelJoin()}
        >
          Cancelar solicitação
        </button>
      ) : null}
    </div>
  );
}

export function CommunityFeed({
  community,
  posts,
  className,
  totalPostCount,
  postsPerPage = DEFAULT_PAGE_SIZE,
  page = 1,
  hasNextPage = false,
  hasPreviousPage = false,
  onNextPage,
  onPreviousPage,
  feedAccessRestricted = false,
  privateGuestLock = null,
  premiumCapabilities,
  onBoostPost,
  boostingPostId = null,
  onLike,
  isLikePending,
}: CommunityFeedProps) {
  const showPagination =
    totalPostCount != null &&
    totalPostCount > postsPerPage &&
    onNextPage != null &&
    onPreviousPage != null;

  const showPrivatePanel = Boolean(privateGuestLock) && posts.length === 0;

  return (
    <section
      className={cn("w-full min-w-0", className)}
      aria-label={`Publicações em ${community.name}`}
    >
      {posts.length === 0 ? (
        showPrivatePanel && privateGuestLock ? (
          <PrivateCommunityGuestPanel community={community} lock={privateGuestLock} />
        ) : (
          <CommunitiesEmptyState
            title={
              feedAccessRestricted
                ? "Discussões só para quem participa"
                : page > 1
                  ? "Nenhuma publicação nesta página"
                  : "Ainda não há posts por aqui"
            }
            description={
              feedAccessRestricted
                ? "As publicações desta comunidade não são mostradas sem acesso. Junta-te (ou inicia sessão) para ver o feed."
                : page > 1
                  ? "Use «Anterior» para voltar ou tente a próxima página."
                  : "Quando alguém publicar, as conversas aparecerão neste feed."
            }
            icon={feedAccessRestricted ? Lock : MessageCircle}
          />
        )
      ) : (
        <>
          <ul className="m-0 list-none space-y-6 p-0 md:space-y-8">
            {posts.map((post) => (
              <li key={post.id}>
                <PostCard
                  post={post}
                  postListingContext="community"
                  onPin={(id) => console.log("Pin", id)}
                  onLike={onLike}
                  isLikePending={isLikePending?.(post.id) ?? false}
                  communityBoost={
                    premiumCapabilities?.isStaffForPremiumTools
                      ? {
                          communityId: community.id,
                          canBoost: Boolean(premiumCapabilities.canBoostCommunityPosts),
                          staffNeedsPremium:
                            Boolean(premiumCapabilities.isStaffForPremiumTools) &&
                            !premiumCapabilities.communityPremiumActive,
                          isBoosting: boostingPostId === post.id,
                          onBoost: onBoostPost ? () => onBoostPost(post.id) : undefined,
                        }
                      : undefined
                  }
                />
              </li>
            ))}
          </ul>
          {showPagination ? (
            <Pagination
              page={page}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
              onNext={onNextPage!}
              onPrevious={onPreviousPage!}
              className="border-t border-[var(--woody-accent)]/8 pt-2"
            />
          ) : null}
        </>
      )}
    </section>
  );
}
