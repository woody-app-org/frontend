import type { CommunityCategory } from "./types";

const LABELS: Record<CommunityCategory, string> = {
  bemestar: "Bem-estar",
  carreira: "Carreira",
  cultura: "Cultura",
  seguranca: "Segurança",
  outro: "Outras",
};

export function getCommunityCategoryLabel(category: CommunityCategory): string {
  return LABELS[category] ?? category;
}
