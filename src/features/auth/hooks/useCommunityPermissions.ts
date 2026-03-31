import type { Community } from "@/domain/types";
import {
  canEditCommunity as canEditCommunityForViewer,
  canManageMembers as canManageMembersForViewer,
  getCommunityMembershipStatus,
  hasPendingCommunityJoin,
  isCommunityAdmin,
  isCommunityMember,
  isCommunityOwner,
} from "@/domain/permissions";
import { useViewerId } from "./useViewerId";

export function useCommunityPermissions(community: Community | null | undefined) {
  const viewerId = useViewerId();
  const communityId = community?.id ?? "";

  return {
    viewerId,
    isOwner: community ? isCommunityOwner(viewerId, community) : false,
    isAdmin: community ? isCommunityAdmin(viewerId, community) : false,
    isMember: communityId ? isCommunityMember(viewerId, communityId) : false,
    membershipStatus: getCommunityMembershipStatus(viewerId, communityId),
    canEditCommunity: community ? canEditCommunityForViewer(viewerId, community) : false,
    canManageMembers: community ? canManageMembersForViewer(viewerId, community) : false,
    hasPendingJoin: hasPendingCommunityJoin(viewerId, communityId),
  };
}
