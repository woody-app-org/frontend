/** Bloqueia o menu de contexto (clique direito / long-press) sobre mídia de publicações. */
export function preventMediaContextMenu(e: React.MouseEvent) {
  e.preventDefault();
}

/** Props comuns para <img>/<video> de publicações: dificultam salvar/compartilhar fora do app. */
export const protectedMediaProps = {
  className: "protected-media",
  draggable: false,
  onContextMenu: preventMediaContextMenu,
} as const;
