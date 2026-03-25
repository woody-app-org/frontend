import { useParams, Link } from "react-router-dom";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import { PostCard } from "@/features/feed/components/PostCard";
import { getCommunityBySlug, getPostsByCommunityId } from "@/domain/selectors";

/**
 * Detalhe da comunidade por slug (rota: `/communities/:communitySlug`).
 */
export function CommunityDetailPage() {
  const { communitySlug } = useParams<{ communitySlug: string }>();
  const community = communitySlug ? getCommunityBySlug(communitySlug) : undefined;
  const posts = community ? getPostsByCommunityId(community.id) : [];

  return (
    <FeedLayout searchSourcePosts={posts}>
      <div className="flex flex-col flex-1 max-w-2xl mx-auto w-full px-3 md:px-6 py-4 md:py-5 pb-16 md:pb-5">
        {!community ? (
          <div className="text-center py-12">
            <p className="text-[var(--woody-muted)]">Comunidade não encontrada.</p>
            <Link
              to="/communities"
              className="text-sm font-medium text-[var(--woody-accent)] mt-4 inline-block hover:underline"
            >
              Ver todas as comunidades
            </Link>
          </div>
        ) : (
          <>
            <Link
              to="/communities"
              className="text-sm text-[var(--woody-nav)] mb-4 inline-block hover:underline"
            >
              ← Comunidades
            </Link>
            <header className="mb-6">
              <h1 className="text-xl font-bold text-[var(--woody-text)]">{community.name}</h1>
              <p className="text-sm text-[var(--woody-muted)] mt-2">{community.description}</p>
              <p className="text-xs text-[var(--woody-muted)] mt-2">
                {community.memberCount} membros{community.tags.length ? ` · ${community.tags.join(", ")}` : ""}
              </p>
            </header>
            <section aria-label="Posts da comunidade" className="space-y-5">
              {posts.length === 0 ? (
                <p className="text-sm text-[var(--woody-muted)]">Ainda não há posts nesta comunidade.</p>
              ) : (
                <ul className="space-y-5 list-none p-0 m-0">
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
              )}
            </section>
          </>
        )}
      </div>
    </FeedLayout>
  );
}
