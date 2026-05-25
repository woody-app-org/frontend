import { useMemo, useRef } from "react";
import { rules } from "../institutional/content";
import { InstitutionalBackLink } from "../institutional/components/InstitutionalBackLink";
import { InstitutionalPrimaryCta } from "../institutional/components/InstitutionalPrimaryCta";
import { INSTITUTIONAL_PATHS } from "../institutional/routes";
import { INSTITUTIONAL_HERO_NOT_ALLOWED } from "../institutional/institutionalMedia";
import { RulesHeroTitle } from "./RulesHeroTitle";
import { ScrollReveal } from "../motion/ScrollReveal";
import { usePrefersReducedMotion } from "../motion/usePrefersReducedMotion";
import { useSectionParallaxY } from "../motion/useSectionParallaxY";
import { cn } from "@/lib/utils";

const rulesTopBarTickerClasses =
  "font-display font-bold uppercase leading-none tracking-[0.2em] text-white/90 text-[11px] sm:text-[12px] md:text-[0.9375rem] md:tracking-[0.22em] lg:text-[1.0625rem]";

export interface RulesNarrativeSectionProps {
  embedInLanding?: boolean;
}

export function RulesNarrativeSection({ embedInLanding = false }: RulesNarrativeSectionProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const parallaxY = useSectionParallaxY(heroRef, reduce || !embedInLanding, embedInLanding ? 14 : 0);
  const motion = embedInLanding;

  const marqueeSegment = useMemo(() => `${rules.topBar}\u00A0\u00A0·\u00A0\u00A0`, []);

  return (
    <div className="overflow-x-clip">
      <ScrollReveal enabled={motion} yOffset={8}>
        <div className="border-b border-white/10 bg-black py-3 md:py-3.5">
          {reduce ? (
            <p
              className={cn(
                "mx-auto max-w-6xl px-[var(--layout-gutter)] text-center leading-relaxed",
                rulesTopBarTickerClasses
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

      <div className="relative w-screen max-w-none -translate-x-1/2 left-1/2">
        <div ref={heroRef} className="relative isolate min-h-[min(80svh,760px)] w-full overflow-hidden md:min-h-[min(88svh,820px)]">
          <img
            src={INSTITUTIONAL_HERO_NOT_ALLOWED}
            alt="Fotografia editorial — convívio e diversidade na comunidade."
            className={
              motion && !reduce
                ? "absolute inset-0 size-full object-cover object-[center_35%] will-change-transform"
                : "absolute inset-0 size-full scale-[1.035] object-cover object-[center_35%]"
            }
            style={
              motion && !reduce
                ? { transform: `translate3d(0, ${parallaxY}px, 0) scale(1.035)` }
                : undefined
            }
            decoding="async"
          />
          <div className="absolute inset-0 bg-black/35 md:bg-black/25" aria-hidden />
          <div
            className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent"
            aria-hidden
          />

          <div className="relative z-10 mx-auto flex min-h-[min(80svh,760px)] max-w-[var(--layout-max-width)] flex-col px-[var(--layout-gutter)] pb-14 pt-20 md:min-h-[min(88svh,820px)] md:pb-20 md:pt-28">
            {!embedInLanding ? (
              <InstitutionalBackLink className="!mb-6 !text-white/80 hover:!text-white md:!mb-10" />
            ) : null}

            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <ScrollReveal enabled={motion} delayMs={70} yOffset={18}>
                <h2 className="font-heading max-w-[min(100%,52rem)] text-balance text-[clamp(1.35rem,4.2vw,3.15rem)] font-bold uppercase leading-[1.1] tracking-[0.04em] text-white drop-shadow-[0_4px_40px_rgba(0,0,0,0.55)] sm:tracking-[0.05em]">
                  <RulesHeroTitle />
                </h2>
              </ScrollReveal>
              {!embedInLanding ? (
                <ScrollReveal enabled={motion} delayMs={140} yOffset={10} className="mt-10 flex flex-wrap items-center justify-center gap-4">
                  <InstitutionalPrimaryCta to={INSTITUTIONAL_PATHS.politicas} variant="dark">
                    Ver políticas
                  </InstitutionalPrimaryCta>
                  <InstitutionalPrimaryCta
                    to={INSTITUTIONAL_PATHS.hub}
                    variant="ghost"
                    className="!border-white/30 !bg-white/10 !text-white hover:!border-white/45 hover:!bg-white/18 focus-visible:!ring-offset-black/40"
                  >
                    Índice institucional
                  </InstitutionalPrimaryCta>
                </ScrollReveal>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
