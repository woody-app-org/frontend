import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import {
  getActiveMemberCountForCommunity,
  getCommunityMemberUsers,
  getJoinRequestForUserInCommunity,
  getPostsByCommunityId,
  isUserMemberOfCommunity,
} from "@/domain/selectors";
import { getCommunityMembershipStatus } from "@/domain/permissions";
import type { Community, Post, User } from "@/domain/types";
import { cn } from "@/lib/utils";
import { woodyLayout } from "@/lib/woody-ui";
import { useViewerId } from "@/features/auth/hooks/useViewerId";
import { useCommunityPermissions } from "@/features/auth/hooks/useCommunityPermissions";
import { getCommunityResolvedBySlug } from "../services/community.service";
import {
  joinCommunityPublic,
  leaveCommunity,
  requestJoinCommunity,
} from "../services/communityMembership.service";
import type { CommunityMembershipActionResult } from "../services/communityMembership.service";
import { CommunityHero } from "../components/CommunityHero";
import { CommunityFeed } from "../components/CommunityFeed";
import { CommunityAboutCard } from "../components/CommunityAboutCard";
import { CommunityTopicsCard } from "../components/CommunityTopicsCard";
import { CommunityRulesQuickCard } from "../components/CommunityRulesQuickCard";
import { CommunityMembersPreview } from "../components/CommunityMembersPreview";
import { CommunityNotFound } from "../components/CommunityNotFound";
import { CommunityEditDialog } from "../components/community-settings/CommunityEditDialog";
import { CommunityMembersManagerDialog } from "../components/members-manager/CommunityMembersManagerDialog";

const COMMUNITY_FEED_PAGE_SIZE = 10;

interface CommunityDetailLoadedProps {
  community: Community;
  posts: Post[];
  members: User[];
  dataRevision: number;
  onDataChanged: () => void;
}

function CommunityDetailLoaded({
  community,
  posts,
  members,
  dataRevision,
  onDataChanged,
}: CommunityDetailLoadedProps) {
  const viewerId = useViewerId();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [ctaBusy, setCtaBusy] = useState(false);
  const [accessNotice, setAccessNotice] = useState<string | null>(null);
  const [feedPage, setFeedPage] = useState(1);

  const isMember = isUserMemberOfCommunity(viewerId, community.id);
  const membershipStatus = getCommunityMembershipStatus(viewerId, community.id);
  const joinRequest = getJoinRequestForUserInCommunity(viewerId, community.id) ?? null;

  const memberCount = useMemo(
    () => getActiveMemberCountForCommunity(community.id),
    [community.id, dataRevision]
  );

  const { canEditCommunity, canManageMembers, isOwner } = useCommunityPermissions(community);

  const runAccess = useCallback(
    async (fn: () => Promise<CommunityMembershipActionResult>) => {
      setCtaBusy(true);
      setAccessNotice(null);
      try {
        const r = await fn();
        if (!r.ok) setAccessNotice(r.error);
        else onDataChanged();
      } finally {
        setCtaBusy(false);
      }
    },
    [onDataChanged]
  );

  const handleSavedSettings = useCallback(() => {
    onDataChanged();
  }, [onDataChanged]);

  const totalPosts = posts.length;
  const feedTotalPages = Math.max(1, Math.ceil(totalPosts / COMMUNITY_FEED_PAGE_SIZE));

  useEffect(() => {
    setFeedPage(1);
  }, [community.id, dataRevision]);

  useEffect(() => {
    if (feedPage > feedTotalPages) {
      setFeedPage(Math.max(1, feedTotalPages));
    }
  }, [feedPage, feedTotalPages]);

  const paginatedPosts = useMemo(() => {
    const start = (feedPage - 1) * COMMUNITY_FEED_PAGE_SIZE;
    return posts.slice(start, start + COMMUNITY_FEED_PAGE_SIZE);
  }, [posts, feedPage]);

  const hasNextFeedPage = feedPage < feedTotalPages;
  const hasPreviousFeedPage = feedPage > 1;

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-7xl flex-col gap-8 md:gap-12 pb-20 md:pb-10",
        woodyLayout.pagePadWide
      )}
    >
      <CommunityHero
        community={community}
        viewerId={viewerId}
        isMember={isMember}
        membershipStatus={membershipStatus}
        joinRequest={joinRequest}
        memberCount={memberCount}
        onLeave={() => runAccess(() => leaveCommunity(viewerId, community.id))}
        onJoinPublic={() => runAccess(() => joinCommunityPublic(viewerId, community.id))}
        onRequestJoin={() => runAccess(() => requestJoinCommunity(viewerId, community.id))}
        ctaBusy={ctaBusy}
        accessNotice={accessNotice}
        canManage={canEditCommunity}
        onManageCommunity={canEditCommunity ? () => setSettingsOpen(true) : undefined}
        canManageMembers={canManageMembers}
        onManageMembers={canManageMembers ? () => setMembersOpen(true) : undefined}
      />

      {canEditCommunity ? (
        <CommunityEditDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          community={community}
          viewerId={viewerId}
          adminRoleLabel={isOwner ? "dona" : "administradora"}
          onSaved={handleSavedSettings}
        />
      ) : null}

      {canManageMembers ? (
        <CommunityMembersManagerDialog
          open={membersOpen}
          onOpenChange={setMembersOpen}
          community={community}
          viewerId={viewerId}
          actorIsOwner={isOwner}
          listRevision={dataRevision}
          onListChanged={onDataChanged}
        />
      ) : null}

      <div
        className={cn(
          "grid grid-cols-1 gap-8 md:gap-10",
          "xl:grid-cols-[minmax(0,1fr)_minmax(280px,22rem)] xl:items-start xl:gap-x-10 xl:gap-y-8",
          "2xl:grid-cols-[minmax(28rem,1fr)_22rem] 2xl:gap-x-12"
        )}
      >
        <CommunityFeed
          community={community}
          posts={paginatedPosts}
          totalPostCount={totalPosts}
          postsPerPage={COMMUNITY_FEED_PAGE_SIZE}
          page={feedPage}
          hasNextPage={hasNextFeedPage}
          hasPreviousPage={hasPreviousFeedPage}
          onNextPage={() => setFeedPage((p) => Math.min(feedTotalPages, p + 1))}
          onPreviousPage={() => setFeedPage((p) => Math.max(1, p - 1))}
          className="order-3 min-w-0 xl:order-1"
        />

        <aside
          className={cn(
            "order-2 flex min-w-0 flex-col gap-5 md:gap-6",
            "xl:order-2 xl:self-start"
          )}
        >
          <CommunityAboutCard community={community} memberCount={memberCount} />
          <CommunityTopicsCard tags={community.tags} />
          <CommunityRulesQuickCard community={community} />
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

  const bump = useCallback(() => setRevision((n) => n + 1), []);

  const community = useMemo(
    () => (communitySlug ? getCommunityResolvedBySlug(communitySlug) : undefined),
    [communitySlug, revision]
  );

  const posts = useMemo(
    () => (community ? getPostsByCommunityId(community.id) : []),
    [community?.id, revision]
  );

  const members = useMemo(
    () => (community ? getCommunityMemberUsers(community.id) : []),
    [community?.id, revision]
  );

  if (!communitySlug) {
    return (
      <FeedLayout showRightPanel={false}>
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
      <FeedLayout showRightPanel={false}>
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
    <FeedLayout showRightPanel={false}>
      <CommunityDetailLoaded
        key={community.id}
        community={community}
        posts={posts}
        members={members}
        dataRevision={revision}
        onDataChanged={bump}
      />
    </FeedLayout>
  );
}
