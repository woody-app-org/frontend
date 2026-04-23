import type { CommunityBillingPlan, CommunityBillingState, CommunityMemberRole, PostCommunityPreview } from "./types";

/** Normaliza valores da API para o union usado no cliente. */
export function normalizeCommunityBillingPlan(v: unknown): CommunityBillingPlan {
  return v === "premium" ? "premium" : "free";
}

/** Indica se a comunidade tem benefícios premium ativos (campo `billing.effectivePlan` da API). */
export function canAccessCommunityPremiumFeatures(billing?: CommunityBillingState): boolean {
  return billing?.effectivePlan === "premium";
}

/** Analytics: exige staff na comunidade + plano premium ativo (paridade com o backend). */
export function canAccessCommunityAnalytics(
  membershipRole: CommunityMemberRole | null | undefined,
  billing?: CommunityBillingState
): boolean {
  const staff = membershipRole === "owner" || membershipRole === "admin";
  return staff && canAccessCommunityPremiumFeatures(billing);
}

/** Impulsionar post: mesma regra base que analytics (ajustável quando o produto divergir). */
export function canBoostCommunityPost(
  membershipRole: CommunityMemberRole | null | undefined,
  billing?: CommunityBillingState
): boolean {
  return canAccessCommunityAnalytics(membershipRole, billing);
}

/** Quando só existe o resumo embutido no post (feed). */
export function canBoostCommunityPostFromPreview(
  membershipRole: CommunityMemberRole | null | undefined,
  preview?: PostCommunityPreview
): boolean {
  const staff = membershipRole === "owner" || membershipRole === "admin";
  return staff && preview?.communityPlan === "premium";
}
