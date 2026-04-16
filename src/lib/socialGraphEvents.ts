/**
 * Evento global leve para alinhar UI após seguir/deixar de seguir (painel direito, feed “Seguindo”, etc.).
 * O feed pode subscrever só quando `filter === "following"` para evitar pedidos desnecessários.
 */
export const SOCIAL_GRAPH_CHANGED_EVENT = "woody-social-graph-changed";

export function dispatchSocialGraphChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SOCIAL_GRAPH_CHANGED_EVENT));
}
