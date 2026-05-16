import { type RefObject, useEffect, useState } from "react";

/**
 * Deslocamento vertical suave (px) com base na posição da secção no viewport.
 * Um único listener passivo + rAF por instância.
 */
export function useSectionParallaxY(
  sectionRef: RefObject<HTMLElement | null>,
  reduceMotion: boolean,
  maxPx = 14
): number {
  const [y, setY] = useState(0);

  useEffect(() => {
    if (reduceMotion || maxPx <= 0) return;

    let raf = 0;
    const tick = () => {
      raf = 0;
      const root = sectionRef.current;
      if (!root) return;
      const r = root.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const center = r.top + r.height * 0.5;
      const t = (vh * 0.5 - center) / (vh * 0.65);
      const clamped = Math.max(-1, Math.min(1, t));
      setY(clamped * maxPx);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    tick();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduceMotion, maxPx, sectionRef]);

  return reduceMotion ? 0 : y;
}
