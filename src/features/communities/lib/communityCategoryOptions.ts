import { getCommunityCategoryLabel } from "@/domain/categoryLabels";
import type { CommunityCategory } from "@/domain/types";

const ORDER: CommunityCategory[] = ["carreira", "bemestar", "cultura", "seguranca", "outro"];

export const COMMUNITY_CATEGORY_OPTIONS: { value: CommunityCategory; label: string }[] = ORDER.map(
  (value) => ({
    value,
    label: getCommunityCategoryLabel(value),
  })
);
