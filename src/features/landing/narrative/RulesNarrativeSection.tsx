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
      <div className="px-[var(--layout-gutter)] py-12 md:py-24">
        <div className="mx-auto max-w-[var(--layout-max-width)]">
          {!embedInLanding && (
            <div className="mb-10">
              <InstitutionalBackLink />
            </div>
          )}

          <ScrollReveal enabled={motion} yOffset={14}>
            <div className="md:pl-8 lg:pl-10">
              <p className="mb-6 font-mono text-sm font-semibold text-[var(--woody-ink)]/38 md:mb-8">// 003</p>

              {/*
                Mobile: flex-col com imagem em largura cheia e círculo sobrepondo por baixo.
                Desktop (sm+): layout lado a lado com sobreposição horizontal (preservado).
              */}
              <div className="flex flex-col items-center sm:flex-row sm:items-start">
                {/* Imagem — mobile: largura cheia, altura controlada */}
                <div
                  className={[
                    "relative z-0 overflow-hidden shrink-0",
                    /* Mobile: largura cheia, altura fixa para não ficar muito alta */
                    "w-full h-[260px]",
                    /* Desktop: largura e aspect-ratio originais */
                    "sm:w-[26rem] sm:h-auto sm:aspect-[3/4]",
                    "lg:w-[31rem]",
                  ].join(" ")}
                >
                  <img
                    src={INSTITUTIONAL_RULES_EDITORIAL}
                    alt=""
                    aria-hidden
                    className="size-full object-cover object-[center_45%]"
                    decoding="async"
                  />
                </div>

                {/*
                  Círculo com título — mobile: centralizado, margem negativa sobe sobre a imagem.
                  Desktop (sm+): margem negativa lateral (preservado).
                */}
                <div
                  className={[
                    "relative z-10 shrink-0",
                    /* Mobile: sobe sobre a foto e centraliza */
                    "-mt-14 self-center",
                    /* Desktop (sm+): overlap lateral original */
                    "sm:mt-0 sm:self-auto sm:-mt-[8rem] sm:-ml-[5.5rem]",
                    "md:-mt-[10rem] md:-ml-[7.5rem]",
                    "lg:-mt-[12rem] lg:-ml-[10rem]",
                    "xl:-mt-[14rem] xl:-ml-[11.5rem]",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "flex aspect-square items-center justify-center rounded-full border border-[var(--woody-ink)]/22 bg-white",
                      /* Mobile: tamanho proporcional, fundo branco para cobrir imagem parcialmente */
                      "w-[min(80vw,18rem)]",
                      /* Desktop: tamanhos originais */
                      "sm:w-[26rem] sm:bg-transparent",
                      "md:w-[min(34rem,46vw)]",
                      "lg:w-[min(38rem,50vw)]",
                    ].join(" ")}
                  >
                    <h2
                      className={[
                        "font-display w-full px-[10%] text-center font-normal leading-[1.06] tracking-[-0.02em] text-[var(--woody-ink)]",
                        /* Mobile: tamanho proporcional ao círculo menor */
                        "text-[clamp(1.6rem,9vw,2.4rem)]",
                        /* Desktop: tamanhos originais */
                        "sm:text-[clamp(2.45rem,6vw,3.85rem)]",
                        "md:text-[clamp(2.65rem,4.8vw,4.25rem)]",
                        "lg:text-[clamp(2.85rem,4.5vw,4.65rem)]",
                      ].join(" ")}
                    >
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
