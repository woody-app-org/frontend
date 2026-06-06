/**
 * Regras de UI alinhadas ao backend para o **espaço** (plano da comunidade + papel staff).
 * Não inclui Woody Pro da utilizadora — isso vive noutros tipos / endpoints de utilizadora.
 */
import type { CommunityBillingPlan, CommunityBillingState, CommunityMemberRole, PostCommunityPreview } from "./types";

/** Normaliza valores da API para o union usado no cliente. */
export function normalizeCommunityBillingPlan(v: unknown): CommunityBillingPlan {
  if (v === "max") return "max";
  return v === "premium" ? "premium" : "free";
}

/** Indica se a comunidade tem benefícios premium ativos — Premium ou Max (campo `billing.effectivePlan` da API). */
export function canAccessCommunityPremiumFeatures(billing?: CommunityBillingState): boolean {
  return billing?.effectivePlan === "premium" || billing?.effectivePlan === "max";
}

/** Indica se a comunidade tem o plano Max ativo. */
export function hasCommunityMaxPlan(billing?: CommunityBillingState): boolean {
  return billing?.effectivePlan === "max";
}

/** Analytics: exige staff na comunidade + plano premium ou Max ativo (paridade com o backend). */
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

/** Gestão avançada Max: staff + plano Max ativo. */
export function canAccessCommunityMaxFeatures(
  membershipRole: CommunityMemberRole | null | undefined,
  billing?: CommunityBillingState
): boolean {
  const staff = membershipRole === "owner" || membershipRole === "admin";
  return staff && hasCommunityMaxPlan(billing);
}

/** Quando só existe o resumo embutido no post (feed). */
export function canBoostCommunityPostFromPreview(
  membershipRole: CommunityMemberRole | null | undefined,
  preview?: PostCommunityPreview
): boolean {
  const staff = membershipRole === "owner" || membershipRole === "admin";
  return staff && (preview?.communityPlan === "premium" || preview?.communityPlan === "max");
}
