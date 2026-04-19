import { useMemo } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { AuthUserSubscription } from "./types";
import {
  canAccessPremiumFeature as canAccessPremiumFeatureFn,
  canCreateCommunity as canCreateCommunityFn,
  isProUser as isProUserFn,
  shouldShowProBadge as shouldShowProBadgeFn,
} from "./subscriptionCapabilities";

/** Capacidades da sessão atual para UI (sempre complementar validação no servidor). */
export interface SubscriptionCapabilities {
  subscription: AuthUserSubscription | undefined;
  isProUser: boolean;
  canCreateCommunity: boolean;
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
      canCreateCommunity: canCreateCommunityFn(subscription),
      shouldShowProBadge: shouldShowProBadgeFn(subscription),
      canOpenBillingPortal: Boolean(subscription?.canOpenBillingPortal),
      canAccessPremiumFeature: (featureId: string) => canAccessPremiumFeatureFn(subscription, featureId),
    }),
    [user],
  );
}
