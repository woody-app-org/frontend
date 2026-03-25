import { woodySection } from "@/lib/woody-ui";
import type { Community, Post } from "@/domain/types";
import { PostCard } from "@/features/feed/components/PostCard";
import { CommunitiesEmptyState } from "./CommunitiesEmptyState";
import { MessageCircle } from "lucide-react";

export interface CommunityFeedProps {
  community: Community;
  posts: Post[];
  className?: string;
}

export function CommunityFeed({ community, posts, className }: CommunityFeedProps) {
  return (
    <section
      className={className}
      aria-labelledby="community-feed-heading"
    >
      <div className="mb-5 md:mb-6">
        <h2 id="community-feed-heading" className={woodySection.title}>
          Discussões em {community.name}
        </h2>
        <p className={woodySection.subtitle}>
          Publicações neste espaço seguro — ligadas à comunidade{" "}
          <span className="font-medium text-[var(--woody-text)]">“{community.name}”</span>.
        </p>
      </div>

      {posts.length === 0 ? (
        <CommunitiesEmptyState
          title="Ainda não há posts por aqui"
          description="Quando alguém publicar, as conversas aparecerão neste feed. Que tal abrir um primeiro tópico acolhedor?"
          icon={MessageCircle}
        />
      ) : (
        <ul className="space-y-5 list-none p-0 m-0">
          {posts.map((post) => (
            <li key={post.id}>
              <PostCard
                post={post}
                postListingContext="community"
                onPin={(id) => console.log("Pin", id)}
                onReport={(id) => console.log("Report", id)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
