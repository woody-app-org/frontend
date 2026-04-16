import { cn } from "@/lib/utils";
import { woodySection } from "@/lib/woody-ui";
import type { Community, Post } from "@/domain/types";
import { PostCard } from "@/features/feed/components/PostCard";
import { Pagination } from "@/features/feed/components/Pagination";
import { CommunitiesEmptyState } from "./CommunitiesEmptyState";
import { Lock, MessageCircle } from "lucide-react";

const DEFAULT_PAGE_SIZE = 10;

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
}: CommunityFeedProps) {
  const showPagination =
    totalPostCount != null &&
    totalPostCount > postsPerPage &&
    onNextPage != null &&
    onPreviousPage != null;

  return (
    <section className={cn("w-full min-w-0", className)} aria-labelledby="community-feed-heading">
      <div className="mb-8 border-b border-[var(--woody-accent)]/10 pb-7 md:mb-10 md:pb-8">
        <h2 id="community-feed-heading" className={woodySection.title}>
          Discussões em {community.name}
        </h2>
        <p className={cn(woodySection.subtitle, "mt-2 max-w-2xl text-pretty")}>
          Só entram aqui publicações feitas <span className="font-medium text-[var(--woody-text)]/90">nesta comunidade</span>
          — o contexto do grupo aparece no cartão.
        </p>
      </div>

      {posts.length === 0 ? (
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
      ) : (
        <>
          <ul className="m-0 list-none space-y-6 p-0 md:space-y-8">
            {posts.map((post) => (
              <li key={post.id}>
                <PostCard
                  post={post}
                  postListingContext="community"
                  onPin={(id) => console.log("Pin", id)}
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
