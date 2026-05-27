import { useMemo } from "react";
import { rules } from "../institutional/content";
import { InstitutionalBackLink } from "../institutional/components/InstitutionalBackLink";
import { INSTITUTIONAL_HERO_WHAT_IS_WOODY } from "../institutional/institutionalMedia";
import { RulesHeroTitle } from "./RulesHeroTitle";
import { ScrollReveal } from "../motion/ScrollReveal";
import { usePrefersReducedMotion } from "../motion/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

const rulesTopBarTickerClasses =
  "font-display font-bold uppercase leading-none tracking-[0.2em] text-white/90 text-[11px] sm:text-[12px] md:text-[0.9375rem] md:tracking-[0.22em] lg:text-[1.0625rem]";

export interface RulesNarrativeSectionProps {
  embedInLanding?: boolean;
}

export function RulesNarrativeSection({ embedInLanding = false }: RulesNarrativeSectionProps) {
  const reduce = usePrefersReducedMotion();
  const motion = embedInLanding;
  const marqueeSegment = useMemo(() => `${rules.topBar}\u00A0\u00A0·\u00A0\u00A0`, []);

  return (
    <div className="overflow-x-clip bg-[#f4f2ec]">
      {/* Faixa marquee preta */}
      <ScrollReveal enabled={motion} yOffset={8}>
        <div className="border-b border-white/10 bg-black py-3 md:py-3.5">
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

      {/* Seção editorial */}
      <div className="px-[var(--layout-gutter)] py-16 md:py-24">
        <div className="mx-auto max-w-[var(--layout-max-width)]">
          {!embedInLanding && (
            <div className="mb-10">
              <InstitutionalBackLink />
            </div>
          )}

          <p className="mb-12 font-mono text-sm font-semibold text-[var(--woody-ink)]/38">// 003</p>

          <div className="flex flex-col items-center gap-14 lg:flex-row lg:items-center lg:gap-16">
            {/* Foto editorial (P&B) */}
            <ScrollReveal enabled={motion} yOffset={14} className="w-full lg:w-[36%] lg:shrink-0">
              <div className="overflow-hidden" style={{ aspectRatio: "3/4" }}>
                <img
                  src={INSTITUTIONAL_HERO_WHAT_IS_WOODY}
                  alt=""
                  aria-hidden
                  className="h-full w-full object-cover object-[center_20%]"
                  style={{ filter: "grayscale(100%)" }}
                  decoding="async"
                />
              </div>
            </ScrollReveal>

            {/* Círculo com título */}
            <ScrollReveal enabled={motion} delayMs={80} yOffset={16} className="flex flex-1 items-center justify-center">
              <div
                className="flex items-center justify-center rounded-full border border-[var(--woody-ink)]/22 p-10 text-center md:p-14"
                style={{ width: "min(90vw, 460px)", aspectRatio: "1" }}
              >
                <h2 className="font-display text-[clamp(1.6rem,4vw,2.9rem)] font-bold leading-[1.1] tracking-[-0.01em] text-[var(--woody-ink)]">
                  <RulesHeroTitle />
                </h2>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
