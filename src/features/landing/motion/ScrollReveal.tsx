import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  yOffset?: number;
  enabled?: boolean;
}

/**
 * Fade + translateY ao entrar no viewport (IntersectionObserver, uma vez).
 */
export function ScrollReveal({ children, className, delayMs = 0, yOffset = 14, enabled = true }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const motionOff = !enabled || reduce;
  const [revealedByScroll, setRevealedByScroll] = useState(false);

  useEffect(() => {
    if (motionOff) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setRevealedByScroll(true);
          io.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [motionOff]);

  const visible = motionOff || revealedByScroll;
  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translate3d(0,0,0)" : `translate3d(0,${yOffset}px,0)`,
    transition: motionOff ? "none" : "opacity 620ms cubic-bezier(0.22,1,0.36,1), transform 620ms cubic-bezier(0.22,1,0.36,1)",
    transitionDelay: motionOff || delayMs === 0 ? undefined : `${delayMs}ms`,
  };

  return (
    <div ref={ref} style={style} className={cn(className)}>
      {children}
    </div>
  );
}
