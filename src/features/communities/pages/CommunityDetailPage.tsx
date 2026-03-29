import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import {
  getCommunityMemberUsers,
  getPostsByCommunityId,
  isUserMemberOfCommunity,
} from "@/domain/selectors";
import type { Community, Post, User } from "@/domain/types";
import { cn } from "@/lib/utils";
import { woodyLayout } from "@/lib/woody-ui";
import { useViewerId } from "@/features/auth/hooks/useViewerId";
import { useCommunityPermissions } from "@/features/auth/hooks/useCommunityPermissions";
import { getCommunityResolvedBySlug } from "../services/community.service";
import { CommunityHero } from "../components/CommunityHero";
import { CommunityFeed } from "../components/CommunityFeed";
import { CommunityInfoPanel } from "../components/CommunityInfoPanel";
import { CommunityMembersPreview } from "../components/CommunityMembersPreview";
import { CommunityNotFound } from "../components/CommunityNotFound";
import { CommunityEditDialog } from "../components/community-settings/CommunityEditDialog";

interface CommunityDetailLoadedProps {
  community: Community;
  posts: Post[];
  members: User[];
  onCommunitySaved: () => void;
}

function CommunityDetailLoaded({ community, posts, members, onCommunitySaved }: CommunityDetailLoadedProps) {
  const viewerId = useViewerId();
  const [isMember, setIsMember] = useState(() => isUserMemberOfCommunity(viewerId, community.id));
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setIsMember(isUserMemberOfCommunity(viewerId, community.id));
  }, [community.id, viewerId]);

  const seedIsMember = isUserMemberOfCommunity(viewerId, community.id);

  const { canEditCommunity, isOwner } = useCommunityPermissions(community);

  const displayMemberCount =
    community.memberCount + (isMember === seedIsMember ? 0 : isMember ? 1 : -1);

  const handleSaved = useCallback(() => {
    onCommunitySaved();
  }, [onCommunitySaved]);

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
        onToggleMembership={() => setIsMember((prev) => !prev)}
        canManage={canEditCommunity}
        onManageCommunity={canEditCommunity ? () => setSettingsOpen(true) : undefined}
      />

      {canEditCommunity ? (
        <CommunityEditDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          community={community}
          viewerId={viewerId}
          adminRoleLabel={isOwner ? "dona" : "administradora"}
          onSaved={handleSaved}
        />
      ) : null}

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
  const [revision, setRevision] = useState(0);

  const community = useMemo(
    () => (communitySlug ? getCommunityResolvedBySlug(communitySlug) : undefined),
    [communitySlug, revision]
  );

  const posts = useMemo(
    () => (community ? getPostsByCommunityId(community.id) : []),
    [community?.id]
  );

  const members = useMemo(
    () => (community ? getCommunityMemberUsers(community.id) : []),
    [community?.id]
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
      <CommunityDetailLoaded
        key={community.id}
        community={community}
        posts={posts}
        members={members}
        onCommunitySaved={() => setRevision((n) => n + 1)}
      />
    </FeedLayout>
  );
}
