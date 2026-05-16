import type { Community } from "@/domain/types";
import type { CommunityMembershipStatusResult } from "@/domain/permissions";
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

export type CommunityPermissionOverrides = Partial<{
  isMember: boolean;
  membershipStatus: CommunityMembershipStatusResult;
  canEditCommunity: boolean;
  canManageMembers: boolean;
  isAdmin: boolean;
  hasPendingJoin: boolean;
}>;

export function useCommunityPermissions(
  community: Community | null | undefined,
  overrides?: CommunityPermissionOverrides
) {
  const viewerId = useViewerId();
  const communityId = community?.id ?? "";

  return {
    viewerId,
    isOwner: community ? isCommunityOwner(viewerId, community) : false,
    isAdmin:
      overrides?.isAdmin ??
      (community ? isCommunityAdmin(viewerId, community) : false),
    isMember:
      overrides?.isMember ??
      (communityId ? isCommunityMember(viewerId, communityId) : false),
    membershipStatus:
      overrides?.membershipStatus ??
      getCommunityMembershipStatus(viewerId, communityId),
    canEditCommunity:
      overrides?.canEditCommunity ??
      (community ? canEditCommunityForViewer(viewerId, community) : false),
    canManageMembers:
      overrides?.canManageMembers ??
      (community ? canManageMembersForViewer(viewerId, community) : false),
    hasPendingJoin:
      overrides?.hasPendingJoin ??
      hasPendingCommunityJoin(viewerId, communityId),
  };
}
