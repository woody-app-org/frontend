import { useCallback, useMemo, useState } from "react";
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
import { CommunityInfoPanel } from "../components/CommunityInfoPanel";
import { CommunityMembersPreview } from "../components/CommunityMembersPreview";
import { CommunityNotFound } from "../components/CommunityNotFound";
import { CommunityEditDialog } from "../components/community-settings/CommunityEditDialog";
import { CommunityMembersManagerDialog } from "../components/members-manager/CommunityMembersManagerDialog";

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

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl flex flex-col gap-8 md:gap-10 pb-20 md:pb-8",
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
        dataRevision={revision}
        onDataChanged={bump}
      />
    </FeedLayout>
  );
}
