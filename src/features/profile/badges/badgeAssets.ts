import seedBadgeImage from "@/assets/badges/seed.png";

/** Critérios de conquista por slug (copy fixa no frontend para MVP). */
export const badgeCriteriaBySlug: Record<string, string> = {
  seed: "Concedida às primeiras contas da fase inicial da Woody.",
};

const badgeIconByKey: Record<string, string> = {
  seed: seedBadgeImage,
};

export function resolveBadgeIconSrc(iconAssetKey?: string | null): string | null {
  if (!iconAssetKey) return null;
  return badgeIconByKey[iconAssetKey] ?? null;
}
