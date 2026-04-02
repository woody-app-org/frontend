import {
  canEditProfile as canEditProfileDomain,
  isOwnProfile as isOwnProfileDomain,
} from "@/domain/permissions";
import { useViewerId } from "./useViewerId";

export function useProfilePermissions(profileUserId: string | undefined) {
  const viewerId = useViewerId();
  const targetId = profileUserId ?? "";

  return {
    viewerId,
    isOwnProfile: isOwnProfileDomain(viewerId, targetId),
    canEditProfile: canEditProfileDomain(viewerId, targetId),
  };
}
