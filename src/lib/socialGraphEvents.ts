/**
 * Eventos globais leves para alinhar UI após mudanças na rede social (seguir, bloquear, etc.).
 */
export const SOCIAL_GRAPH_CHANGED_EVENT = "woody-social-graph-changed";
export const BLOCK_RELATIONSHIP_CHANGED_EVENT = "woody-block-changed";

export type BlockRelationshipChangedDetail = {
  userId?: string;
};

export function dispatchSocialGraphChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SOCIAL_GRAPH_CHANGED_EVENT));
}

export function dispatchBlockRelationshipChanged(userId?: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<BlockRelationshipChangedDetail>(BLOCK_RELATIONSHIP_CHANGED_EVENT, {
      detail: { userId },
    })
  );
}
