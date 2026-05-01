import { useRef } from "react";
import { whatIsWoody } from "../institutional/content";
import { InstitutionalBackLink } from "../institutional/components/InstitutionalBackLink";
import { InstitutionalPrimaryCta } from "../institutional/components/InstitutionalPrimaryCta";
import { INSTITUTIONAL_PATHS } from "../institutional/routes";
import { INSTITUTIONAL_HERO_WHAT_IS_WOODY } from "../institutional/institutionalMedia";
import { LANDING_NARRATIVE_IDS } from "../constants";
import { ScrollReveal } from "../motion/ScrollReveal";
import { usePrefersReducedMotion } from "../motion/usePrefersReducedMotion";
import { useSectionParallaxY } from "../motion/useSectionParallaxY";

export interface WhatIsWoodySectionProps {
  /** Na landing longa: sem «voltar» e CTAs com âncoras. */
  embedInLanding?: boolean;
}

export function WhatIsWoodySection({ embedInLanding = false }: WhatIsWoodySectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const parallaxY = useSectionParallaxY(sectionRef, reduce || !embedInLanding, embedInLanding ? 12 : 0);

  const missaoLink = embedInLanding
    ? ({ href: `#${LANDING_NARRATIVE_IDS.missao}` } as const)
    : ({ to: INSTITUTIONAL_PATHS.missao } as const);
  const regrasLink = embedInLanding
    ? ({ href: `#${LANDING_NARRATIVE_IDS.regras}` } as const)
    : ({ to: INSTITUTIONAL_PATHS.regras } as const);

  const motion = embedInLanding;

  return (
    <div ref={sectionRef} className="relative text-white">
      <div className="relative isolate min-h-[min(82svh,780px)] w-full overflow-hidden md:min-h-[min(88svh,860px)]">
        <img
          src={INSTITUTIONAL_HERO_WHAT_IS_WOODY}
          alt="Composição visual associada à identidade Woody."
          className={
            motion && !reduce
              ? "absolute inset-0 size-full object-cover object-[center_20%] will-change-transform"
              : "absolute inset-0 size-full scale-[1.04] object-cover object-[center_20%]"
          }
          style={
            motion && !reduce
              ? { transform: `translate3d(0, ${parallaxY}px, 0) scale(1.04)` }
              : undefined
          }
          decoding="async"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/82 via-black/45 to-black/10 md:from-black/75 md:via-black/35 md:to-transparent"
          aria-hidden
        />
        <div
          className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 to-transparent md:h-36"
          aria-hidden
        />

        <div className="relative z-10 flex min-h-[min(82svh,780px)] flex-col justify-end px-[var(--layout-gutter)] pb-16 pt-28 md:min-h-[min(88svh,860px)] md:justify-center md:pb-24 md:pt-32">
          <div className="relative mx-auto w-full max-w-[var(--layout-max-width)]">
            {!embedInLanding ? (
              <InstitutionalBackLink className="!mb-8 !text-white/75 hover:!text-white md:!absolute md:!left-0 md:!top-20 md:!mb-0" />
            ) : null}

            <div className="max-w-[min(100%,34rem)] md:max-w-[min(100%,38rem)]">
              <ScrollReveal enabled={motion} yOffset={16}>
                <h2 className="font-sans text-[clamp(2.35rem,7.5vw,4.75rem)] font-bold leading-[0.98] tracking-[-0.04em] text-white drop-shadow-[0_4px_48px_rgba(0,0,0,0.55)]">
                  {whatIsWoody.title}
                </h2>
              </ScrollReveal>

              <ScrollReveal enabled={motion} delayMs={90} yOffset={12} className="mt-10">
                <div className="space-y-6 font-sans text-[clamp(0.98rem,2.1vw,1.12rem)] font-medium leading-[1.72] text-white/92 drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]">
                  {whatIsWoody.paragraphs.map((p) => (
                    <p key={p.slice(0, 28)}>{p}</p>
                  ))}
                </div>
              </ScrollReveal>

              <ScrollReveal enabled={motion} delayMs={180} yOffset={10} className="mt-12">
                <div className="flex flex-wrap items-center gap-4">
                  <InstitutionalPrimaryCta
                    {...missaoLink}
                    variant="limeSolid"
                    showChevron={false}
                  >
                    Missão principal
                  </InstitutionalPrimaryCta>
                  <InstitutionalPrimaryCta
                    {...regrasLink}
                    variant="ghost"
                    showChevron
                    className="!border-white/30 !bg-white/10 !text-white hover:!border-white/45 hover:!bg-white/18 focus-visible:!ring-offset-black/40"
                  >
                    Regras de convívio
                  </InstitutionalPrimaryCta>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
