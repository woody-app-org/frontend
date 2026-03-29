import { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import {
  getCommunityBySlug,
  getCommunityMemberUsers,
  getPostsByCommunityId,
  isUserMemberOfCommunity,
} from "@/domain/selectors";
import type { Community, Post, User } from "@/domain/types";
import { cn } from "@/lib/utils";
import { woodyLayout } from "@/lib/woody-ui";
import { useViewerId } from "@/features/auth/hooks/useViewerId";
import { CommunityHero } from "../components/CommunityHero";
import { CommunityFeed } from "../components/CommunityFeed";
import { CommunityInfoPanel } from "../components/CommunityInfoPanel";
import { CommunityMembersPreview } from "../components/CommunityMembersPreview";
import { CommunityNotFound } from "../components/CommunityNotFound";

interface CommunityDetailLoadedProps {
  community: Community;
  posts: Post[];
  members: User[];
}

function CommunityDetailLoaded({ community, posts, members }: CommunityDetailLoadedProps) {
  const viewerId = useViewerId();
  const seedIsMember = isUserMemberOfCommunity(viewerId, community.id);
  const [isMember, setIsMember] = useState(seedIsMember);

  const displayMemberCount =
    community.memberCount + (isMember === seedIsMember ? 0 : isMember ? 1 : -1);

  const toggleMembership = useCallback(() => {
    setIsMember((prev) => !prev);
  }, []);

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl flex flex-col gap-8 md:gap-10 pb-20 md:pb-8",
        woodyLayout.pagePadWide
      )}
    >
      <CommunityHero
        community={community}
        isMember={isMember}
        displayMemberCount={displayMemberCount}
        onToggleMembership={toggleMembership}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px] lg:items-start lg:gap-10 xl:gap-12">
        <CommunityFeed community={community} posts={posts} className="order-2 min-w-0 lg:order-1" />

        <aside className="order-1 flex min-w-0 flex-col gap-6 lg:order-2 lg:sticky lg:top-16 lg:self-start">
          <CommunityInfoPanel community={community} />
          <CommunityMembersPreview members={members} />
        </aside>
      </div>
    </div>
  );
}

/**
 * Detalhe da comunidade por slug (`/communities/:communitySlug`).
 */
export function CommunityDetailPage() {
  const { communitySlug } = useParams<{ communitySlug: string }>();
  const community = useMemo(
    () => (communitySlug ? getCommunityBySlug(communitySlug) : undefined),
    [communitySlug]
  );
  const posts = useMemo(
    () => (community ? getPostsByCommunityId(community.id) : []),
    [community]
  );
  const members = useMemo(
    () => (community ? getCommunityMemberUsers(community.id) : []),
    [community]
  );

  if (!communitySlug) {
    return (
      <FeedLayout>
        <div
          className={cn(
            "mx-auto flex max-w-6xl justify-center py-10 md:py-14 pb-20 md:pb-10",
            woodyLayout.pagePadWide
          )}
        >
          <CommunityNotFound />
        </div>
      </FeedLayout>
    );
  }

  if (!community) {
    return (
      <FeedLayout>
        <div
          className={cn(
            "mx-auto flex max-w-6xl justify-center py-10 md:py-14 pb-20 md:pb-10",
            woodyLayout.pagePadWide
          )}
        >
          <CommunityNotFound />
        </div>
      </FeedLayout>
    );
  }

  return (
    <FeedLayout>
      <CommunityDetailLoaded key={community.id} community={community} posts={posts} members={members} />
    </FeedLayout>
  );
}
