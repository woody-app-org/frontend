import { useMemo } from "react";
import { rules } from "../institutional/content";
import { ScrollReveal } from "../motion/ScrollReveal";
import { usePrefersReducedMotion } from "../motion/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

const rulesTopBarTickerClasses =
  "font-display font-bold uppercase leading-none tracking-[0.2em] text-white/90 text-[11px] sm:text-[12px] md:text-[0.9375rem] md:tracking-[0.22em] lg:text-[1.0625rem]";

export interface RulesMarqueeBarProps {
  animate?: boolean;
}

export function RulesMarqueeBar({ animate = false }: RulesMarqueeBarProps) {
  const reduce = usePrefersReducedMotion();
  const marqueeSegment = useMemo(() => `${rules.topBar}\u00A0\u00A0·\u00A0\u00A0`, []);

  return (
    <ScrollReveal enabled={animate} yOffset={8}>
      <div className="border-t border-white/10 bg-black py-3 md:py-3.5">
        {reduce ? (
          <p
            className={cn(
              "mx-auto max-w-6xl px-[var(--layout-gutter)] text-center leading-relaxed",
              rulesTopBarTickerClasses,
            )}
          >
            {rules.topBar}
          </p>
        ) : (
          <div className="overflow-hidden" role="presentation">
            <div className={cn("woody-rules-marquee-track", rulesTopBarTickerClasses)}>
              <span className="shrink-0 whitespace-nowrap">{marqueeSegment}</span>
              <span className="shrink-0 whitespace-nowrap" aria-hidden>
                {marqueeSegment}
              </span>
            </div>
          </div>
        )}
      </div>
    </ScrollReveal>
  );
}
