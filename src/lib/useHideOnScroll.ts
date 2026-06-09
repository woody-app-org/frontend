import { useEffect, useRef, useState } from "react";

/**
 * Esconde o header ao rolar para baixo e mostra ao rolar para cima.
 * Retorna `true` quando o header deve estar oculto.
 *
 * @param threshold  Distância mínima de scroll (px) antes de ativar — evita
 *                   ocultar ao menor toque. Default: 64.
 */
export function useHideOnScroll(threshold = 64): boolean {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;

      if (y < threshold) {
        // Perto do topo — sempre visível
        setHidden(false);
      } else if (y > lastY.current + 4) {
        // Scrolling down (com pequeno buffer para evitar flicker)
        setHidden(true);
      } else if (y < lastY.current - 4) {
        // Scrolling up
        setHidden(false);
      }

      lastY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return hidden;
}
