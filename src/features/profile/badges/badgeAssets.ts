import seedBadgeImage from "@/assets/badges/seed.png";
import testBadgeImage from "@/assets/badges/test.jpeg";

/** Critérios de conquista por slug (copy fixa no frontend para MVP). */
export const badgeCriteriaBySlug: Record<string, string> = {
  seed: "Concedida às primeiras contas da fase inicial da Woody.",
  test: "Apenas para teste visual de múltiplas insígnias no perfil.",
};

const badgeIconByKey: Record<string, string> = {
  seed: seedBadgeImage,
  test: testBadgeImage,
};

export function resolveBadgeIconSrc(iconAssetKey?: string | null): string | null {
  if (!iconAssetKey) return null;
  return badgeIconByKey[iconAssetKey] ?? null;
}

/** Tamanho uniforme das insígnias no perfil (lista, stack mobile e desktop). */
export const profileBadgeSizeClass = "size-20";
export const profileBadgeImageClass =
  "block size-full rounded-full object-cover object-center scale-[1.18]";
export const PROFILE_BADGE_SIZE_PX = 80;
export const PROFILE_BADGE_STACK_OFFSET_PX = 20;
