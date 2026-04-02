import { cn } from "@/lib/utils";
import type { Community } from "@/domain/types";
import { CommunityAboutCard } from "./CommunityAboutCard";
import { CommunityRulesQuickCard } from "./CommunityRulesQuickCard";

/**
 * @deprecated Para nova hierarquia da página de comunidade, prefira compor
 * `CommunityAboutCard`, `CommunityTopicsCard` e `CommunityRulesQuickCard` separadamente.
 */
export interface CommunityInfoPanelProps {
  community: Community;
  memberCount: number;
  className?: string;
}

export function CommunityInfoPanel({ community, memberCount, className }: CommunityInfoPanelProps) {
  return (
    <div className={cn("flex flex-col gap-5 md:gap-6", className)}>
      <CommunityAboutCard community={community} memberCount={memberCount} />
      <CommunityRulesQuickCard community={community} />
    </div>
  );
}
