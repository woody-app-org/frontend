import type { AuthUserSubscription } from "@/features/subscription/types";
import type { AuthUser, UserRole, VerificationStatus } from "./types";

const defaultSubscription = (): AuthUserSubscription => ({
  effectivePlan: "free",
  billingPlan: "free",
  planCode: "free",
  status: "active",
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  showProBadge: false,
  canOpenBillingPortal: false,
});

export function mapSubscription(raw: unknown): AuthUserSubscription {
  if (!raw || typeof raw !== "object") return defaultSubscription();
  const o = raw as Record<string, unknown>;
  const badge =
    o.subscriptionBadge === "max" ? "max" : o.subscriptionBadge === "pro" ? "pro" : null;
  return {
    effectivePlan:
      o.effectivePlan === "max" ? "max" : o.effectivePlan === "pro" ? "pro" : "free",
    billingPlan:
      o.billingPlan === "max" ? "max" : o.billingPlan === "pro" ? "pro" : "free",
    planCode: o.planCode != null ? String(o.planCode) : null,
    status: typeof o.status === "string" ? o.status : "active",
    currentPeriodEnd: o.currentPeriodEnd != null ? String(o.currentPeriodEnd) : null,
    cancelAtPeriodEnd: Boolean(o.cancelAtPeriodEnd),
    showProBadge: Boolean(o.showProBadge),
    subscriptionBadge: badge,
    canOpenBillingPortal: Boolean(o.canOpenBillingPortal),
  };
}

export function mapAuthUser(raw: {
  id: string;
  username: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  subscription?: unknown;
  verificationStatus?: string;
  role?: string;
}): AuthUser {
  return {
    id: String(raw.id),
    username: raw.username,
    email: raw.email,
    name: raw.name ?? raw.username,
    avatarUrl: raw.avatarUrl,
    subscription: mapSubscription(raw.subscription),
    verificationStatus: (raw.verificationStatus as VerificationStatus | undefined) ?? "PendingDocument",
    role: (raw.role as UserRole | undefined) ?? "User",
  };
}

export function normalizeStoredUser(u: AuthUser): AuthUser {
  return {
    ...u,
    subscription: u.subscription ?? defaultSubscription(),
    verificationStatus: u.verificationStatus ?? "PendingDocument",
    role: u.role ?? "User",
  };
}
