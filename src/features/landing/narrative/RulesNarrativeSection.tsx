import { useRef } from "react";
import { ChevronDown } from "lucide-react";
import { rules } from "../institutional/content";
import { InstitutionalBackLink } from "../institutional/components/InstitutionalBackLink";
import { InstitutionalPrimaryCta } from "../institutional/components/InstitutionalPrimaryCta";
import { InstitutionalProse } from "../institutional/components/InstitutionalProse";
import { INSTITUTIONAL_PATHS } from "../institutional/routes";
import { INSTITUTIONAL_HERO_NOT_ALLOWED } from "../institutional/institutionalMedia";
import { LANDING_NARRATIVE_IDS } from "../constants";
import { RulesHeroTitle } from "./RulesHeroTitle";
import { ScrollReveal } from "../motion/ScrollReveal";
import { usePrefersReducedMotion } from "../motion/usePrefersReducedMotion";
import { useSectionParallaxY } from "../motion/useSectionParallaxY";

export interface RulesNarrativeSectionProps {
  embedInLanding?: boolean;
}

export function RulesNarrativeSection({ embedInLanding = false }: RulesNarrativeSectionProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const parallaxY = useSectionParallaxY(heroRef, reduce || !embedInLanding, embedInLanding ? 14 : 0);
  const motion = embedInLanding;

  const politicasLink = embedInLanding
    ? ({ href: `#${LANDING_NARRATIVE_IDS.politicas}` } as const)
    : ({ to: INSTITUTIONAL_PATHS.politicas } as const);
  const extraLink = embedInLanding
    ? ({ href: `#${LANDING_NARRATIVE_IDS.oQueEWoody}` } as const)
    : ({ to: INSTITUTIONAL_PATHS.hub } as const);
  const extraLabel = embedInLanding ? "Voltar ao início" : "Índice institucional";

  return (
    <div className="overflow-x-clip">
      <ScrollReveal enabled={motion} yOffset={8}>
        <div className="border-b border-white/10 bg-black px-[var(--layout-gutter)] py-3.5 md:py-4">
          <p className="mx-auto max-w-6xl text-center text-[10px] font-bold uppercase leading-relaxed tracking-[0.2em] text-white/90 sm:text-[11px] md:tracking-[0.22em]">
            {rules.topBar}
          </p>
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
                <h2 className="max-w-[min(100%,52rem)] font-sans text-[clamp(1.35rem,4.2vw,3.15rem)] font-extrabold uppercase leading-[1.08] tracking-[0.06em] text-white drop-shadow-[0_4px_40px_rgba(0,0,0,0.55)]">
                  <RulesHeroTitle />
                </h2>
              </ScrollReveal>
              <ScrollReveal enabled={motion} delayMs={140} yOffset={10} className="mt-10 flex justify-center">
                <span
                  className="inline-flex size-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white shadow-[0_0_40px_-8px_rgba(255,255,255,0.35)] transition-transform duration-300 ease-out motion-reduce:transition-none"
                  style={
                    motion && !reduce ? { transform: `translate3d(0, ${parallaxY * 0.35}px, 0)` } : undefined
                  }
                  aria-hidden
                >
                  <ChevronDown className="size-6" />
                </span>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>

      <div
        className={
          embedInLanding
            ? "bg-[#f4f2ec] px-[var(--layout-gutter)] pb-20 pt-12 md:pb-24 md:pt-16"
            : "px-[var(--layout-gutter)] pb-24 pt-14 md:pt-20"
        }
      >
        <div className="mx-auto max-w-[var(--layout-max-width)]">
          <ScrollReveal enabled={motion} delayMs={40} yOffset={14}>
            <div className="mx-auto max-w-2xl md:ml-[4%] md:mr-auto lg:max-w-[26rem] lg:ml-[6%]">
              <InstitutionalProse>
                <p className="!text-[1.05rem] !leading-[1.8]">{rules.intro}</p>
                <ul className="mt-8 list-none space-y-5 border-l-2 border-[var(--woody-lime)]/50 pl-6">
                  {rules.bullets.map((b) => (
                    <li key={b.slice(0, 32)} className="relative text-[0.98rem] leading-relaxed">
                      <span
                        className="absolute -left-[1.35rem] top-2.5 size-2 rounded-full bg-[var(--woody-lime)]"
                        aria-hidden
                      />
                      {b}
                    </li>
                  ))}
                </ul>
              </InstitutionalProse>
              <div className="mt-12 flex flex-wrap gap-3">
                <InstitutionalPrimaryCta {...politicasLink} variant="dark">
                  Ver políticas
                </InstitutionalPrimaryCta>
                <InstitutionalPrimaryCta {...extraLink} variant="ghost">
                  {extraLabel}
                </InstitutionalPrimaryCta>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
