import { useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { whatIsWoody } from "../institutional/content";
import { InstitutionalBackLink } from "../institutional/components/InstitutionalBackLink";
import { InstitutionalPrimaryCta } from "../institutional/components/InstitutionalPrimaryCta";
import { INSTITUTIONAL_PATHS } from "../institutional/routes";
import { INSTITUTIONAL_HERO_WHAT_IS_WOODY } from "../institutional/institutionalMedia";
import { ScrollReveal } from "../motion/ScrollReveal";
import { usePrefersReducedMotion } from "../motion/usePrefersReducedMotion";
import { useSectionParallaxY } from "../motion/useSectionParallaxY";
import { cn } from "@/lib/utils";

/** Fim do trecho curto no hero — apenas mobile (resto atrás de «ler mais»). */
const WHAT_IS_WOODY_MOBILE_PREVIEW_END = "e pessoas alinhadas ao feminino.";

function splitWhatIsWoodyFirstParagraph(): {
  preview: string;
  restFirst: string;
  second: string;
  hasBreakpoint: boolean;
} {
  const first = whatIsWoody.paragraphs[0] ?? "";
  const second = whatIsWoody.paragraphs[1] ?? "";
  const idx = first.indexOf(WHAT_IS_WOODY_MOBILE_PREVIEW_END);
  if (idx === -1) {
    return { preview: first, restFirst: "", second, hasBreakpoint: false };
  }
  const end = idx + WHAT_IS_WOODY_MOBILE_PREVIEW_END.length;
  return {
    preview: first.slice(0, end),
    restFirst: first.slice(end).trimStart(),
    second,
    hasBreakpoint: true,
  };
}

export interface WhatIsWoodySectionProps {
  /** Na landing longa: sem «voltar» e CTAs com âncoras. */
  embedInLanding?: boolean;
}

export function WhatIsWoodySection({ embedInLanding = false }: WhatIsWoodySectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const parallaxY = useSectionParallaxY(sectionRef, reduce || !embedInLanding, embedInLanding ? 12 : 0);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const mobileSplit = useMemo(splitWhatIsWoodyFirstParagraph, []);

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
                {/* Desktop / tablet: texto completo */}
                <div className="hidden space-y-6 font-sans text-[clamp(0.98rem,2.1vw,1.12rem)] font-medium leading-[1.72] text-white/92 drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] md:block">
                  {whatIsWoody.paragraphs.map((p) => (
                    <p key={p.slice(0, 28)}>{p}</p>
                  ))}
                </div>

                {/* Mobile: prévia + «ler mais» — min-height no colapsado para alinhar o título como com o texto completo (justify-end) */}
                <div
                  className={cn(
                    "font-sans text-[clamp(0.98rem,2.1vw,1.12rem)] font-medium leading-[1.72] text-white/92 drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] md:hidden",
                    !mobileExpanded &&
                      mobileSplit.hasBreakpoint &&
                      "min-h-[min(28rem,56svh)]"
                  )}
                >
                  {!mobileSplit.hasBreakpoint || mobileExpanded ? (
                    <div id="what-is-woody-mobile-body" className="space-y-6">
                      {whatIsWoody.paragraphs.map((p) => (
                        <p key={p.slice(0, 28)}>{p}</p>
                      ))}
                      {mobileSplit.hasBreakpoint ? (
                        <button
                          type="button"
                          onClick={() => setMobileExpanded(false)}
                          className={cn(
                            "inline-flex items-center gap-1.5 border-b border-white/35 pb-0.5 text-sm font-semibold text-white/90 transition-colors",
                            "hover:border-white/55 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black/30"
                          )}
                        >
                          Mostrar menos
                          <ChevronDown className="size-4 rotate-180 opacity-90" aria-hidden />
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    <>
                      <p>{mobileSplit.preview}</p>
                      <button
                        type="button"
                        onClick={() => setMobileExpanded(true)}
                        aria-expanded={mobileExpanded}
                        aria-controls="what-is-woody-mobile-body"
                        className={cn(
                          "group mt-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-sm font-semibold text-white shadow-[0_2px_16px_rgba(0,0,0,0.35)] backdrop-blur-[2px] transition-[border-color,background-color,color]",
                          "hover:border-white/40 hover:bg-white/16 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55 focus-visible:ring-offset-2 focus-visible:ring-offset-black/35",
                          "touch-manipulation"
                        )}
                      >
                        <span>ler mais</span>
                        <ChevronDown
                          className="size-[1.05rem] shrink-0 opacity-95 transition-transform duration-200 group-hover:translate-y-0.5"
                          strokeWidth={2.25}
                          aria-hidden
                        />
                      </button>
                    </>
                  )}
                </div>
              </ScrollReveal>

              {!embedInLanding ? (
                <ScrollReveal enabled={motion} delayMs={180} yOffset={10} className="mt-12">
                  <div className="flex flex-wrap items-center gap-4">
                    <InstitutionalPrimaryCta to={INSTITUTIONAL_PATHS.missao} variant="limeSolid" showChevron={false}>
                      Missão principal
                    </InstitutionalPrimaryCta>
                    <InstitutionalPrimaryCta
                      to={INSTITUTIONAL_PATHS.regras}
                      variant="ghost"
                      showChevron
                      className="!border-white/30 !bg-white/10 !text-white hover:!border-white/45 hover:!bg-white/18 focus-visible:!ring-offset-black/40"
                    >
                      Regras de convívio
                    </InstitutionalPrimaryCta>
                  </div>
                </ScrollReveal>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
