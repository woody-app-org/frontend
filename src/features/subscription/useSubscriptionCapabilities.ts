import { useMemo } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { AuthUserSubscription } from "./types";
import {
  canAccessPremiumFeature as canAccessPremiumFeatureFn,
  canCreateCommunity as canCreateCommunityFn,
  isMaxUser as isMaxUserFn,
  isProUser as isProUserFn,
  canSetOwnedCommunityPrivate as canSetOwnedCommunityPrivateFn,
  shouldShowProBadge as shouldShowProBadgeFn,
} from "./subscriptionCapabilities";

/** Capacidades da sessão atual para UI (sempre complementar validação no servidor). */
export interface SubscriptionCapabilities {
  subscription: AuthUserSubscription | undefined;
  isProUser: boolean;
  isMaxUser: boolean;
  canCreateCommunity: boolean;
  /** Pode colocar a comunidade que é dona em modo privado (exige Max). */
  canSetOwnedCommunityPrivate: boolean;
  shouldShowProBadge: boolean;
  /** Cliente Stripe associado na base — abre o portal seguro da Stripe. */
  canOpenBillingPortal: boolean;
  canAccessPremiumFeature: (featureId: string) => boolean;
}

export function useSubscriptionCapabilities(): SubscriptionCapabilities {
  const { user } = useAuth();
  const subscription = user?.subscription;

  return useMemo(
    () => ({
      subscription,
      isProUser: isProUserFn(subscription),
      isMaxUser: isMaxUserFn(subscription),
      canCreateCommunity: canCreateCommunityFn(subscription),
      canSetOwnedCommunityPrivate: canSetOwnedCommunityPrivateFn(subscription),
      shouldShowProBadge: shouldShowProBadgeFn(subscription),
      canOpenBillingPortal: Boolean(subscription?.canOpenBillingPortal),
      canAccessPremiumFeature: (featureId: string) => canAccessPremiumFeatureFn(subscription, featureId),
    }),
    [subscription],
  );
}
