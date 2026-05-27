import { InstitutionalBackLink } from "../institutional/components/InstitutionalBackLink";
import { INSTITUTIONAL_RULES_EDITORIAL } from "../institutional/institutionalMedia";
import { RulesHeroTitle } from "./RulesHeroTitle";
import { RulesMarqueeBar } from "./RulesMarqueeBar";
import { ScrollReveal } from "../motion/ScrollReveal";

export interface RulesNarrativeSectionProps {
  embedInLanding?: boolean;
}

export function RulesNarrativeSection({ embedInLanding = false }: RulesNarrativeSectionProps) {
  const motion = embedInLanding;

  return (
    <div className="overflow-x-clip bg-white">
      {/* Seção editorial */}
      <div className="px-[var(--layout-gutter)] py-16 md:py-24">
        <div className="mx-auto max-w-[var(--layout-max-width)]">
          {!embedInLanding && (
            <div className="mb-10">
              <InstitutionalBackLink />
            </div>
          )}

          <ScrollReveal enabled={motion} yOffset={14}>
            <div className="md:pl-8 lg:pl-10">
              <p className="mb-8 font-mono text-sm font-semibold text-[var(--woody-ink)]/38">// 003</p>

              <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-start">
                {/* Imagem */}
                <div className="relative z-0 w-[22rem] max-w-full shrink-0 overflow-hidden sm:w-[26rem] lg:w-[31rem]" style={{ aspectRatio: "3/4" }}>
                  <img
                    src={INSTITUTIONAL_RULES_EDITORIAL}
                    alt=""
                    aria-hidden
                    className="size-full object-cover object-[center_45%]"
                    decoding="async"
                  />
                </div>

                {/* Círculo atravessando a imagem */}
                <div className="relative z-10 shrink-0 sm:-mt-[8rem] sm:-ml-[5.5rem] md:-mt-[10rem] md:-ml-[7.5rem] lg:-mt-[12rem] lg:-ml-[10rem] xl:-mt-[14rem] xl:-ml-[11.5rem]">
                  <div className="flex aspect-square w-[min(92vw,22rem)] items-center justify-center rounded-full border border-[var(--woody-ink)]/22 bg-transparent sm:w-[26rem] md:w-[min(34rem,46vw)] lg:w-[min(38rem,50vw)]">
                    <h2 className="font-display w-full px-[10%] text-center text-[clamp(2.1rem,5.5vw,3.15rem)] font-normal leading-[1.06] tracking-[-0.02em] text-[var(--woody-ink)] sm:text-[clamp(2.45rem,6vw,3.85rem)] md:text-[clamp(2.65rem,4.8vw,4.25rem)] lg:text-[clamp(2.85rem,4.5vw,4.65rem)]">
                      <RulesHeroTitle multiline />
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Página standalone de regras mantém a faixa aqui */}
      {!embedInLanding && <RulesMarqueeBar />}
    </div>
  );
}
