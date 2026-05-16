import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/features/landing/motion/usePrefersReducedMotion";

const TAP_ANIM_CLEAR_MS = 300;

/**
 * Dispara uma micro-animação no ícone de like (curtir / descurtir) sem alterar a lógica de negócio.
 * Respeita `prefers-reduced-motion`.
 */
export function usePostLikeTapAnimation() {
  const reduce = usePrefersReducedMotion();
  const [tapPhase, setTapPhase] = useState<"in" | "out" | null>(null);
  const timerRef = useRef(0);

  const triggerTap = useCallback(
    (willBecomeLiked: boolean) => {
      if (reduce) return;
      window.clearTimeout(timerRef.current);
      setTapPhase(willBecomeLiked ? "in" : "out");
      timerRef.current = window.setTimeout(() => setTapPhase(null), TAP_ANIM_CLEAR_MS);
    },
    [reduce]
  );

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  return { tapPhase, triggerTap };
}
