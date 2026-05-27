import { whatIsWoody } from "../institutional/content";
import { InstitutionalBackLink } from "../institutional/components/InstitutionalBackLink";
import { INSTITUTIONAL_HERO_WHAT_IS_WOODY } from "../institutional/institutionalMedia";
import { ScrollReveal } from "../motion/ScrollReveal";

export interface WhatIsWoodySectionProps {
  embedInLanding?: boolean;
}

export function WhatIsWoodySection({ embedInLanding = false }: WhatIsWoodySectionProps) {
  const motion = embedInLanding;

  return (
    <div className="bg-[#f4f2ec]">
      {/* Foto hero — topo, sem overlay de texto */}
      <div className="w-full overflow-hidden" style={{ height: "min(58svh, 540px)" }}>
        <img
          src={INSTITUTIONAL_HERO_WHAT_IS_WOODY}
          alt="Composição visual associada à identidade Woody."
          className="h-full w-full object-cover object-[74%_38%] brightness-[1.2] md:object-[70%_36%]"
          decoding="async"
        />
      </div>

      {/* Conteúdo editorial */}
      <div className="px-[var(--layout-gutter)] pb-16 pt-8 md:pb-24 md:pt-10">
        <div className="mx-auto max-w-[var(--layout-max-width)]">
          {!embedInLanding && (
            <div className="mb-10">
              <InstitutionalBackLink />
            </div>
          )}

          <ScrollReveal enabled={motion} yOffset={14}>
            <div className="grid grid-cols-1 md:grid-cols-12 md:gap-x-10 lg:gap-x-14">
              {/* Rótulo editorial — centralizado verticalmente com o título */}
              <div className="pt-6 md:col-span-4 md:row-start-1 md:flex md:items-center md:pl-8 md:pt-0 lg:col-span-4 lg:pl-10">
                <div className="w-full max-w-[min(100%,21rem)] font-heading text-[clamp(1.05rem,2.8vw,1.55rem)] font-black uppercase leading-[1.06] tracking-[0.02em] text-[var(--woody-ink)] md:max-w-[23rem]">
                  <p className="flex justify-between">
                    <span>SE</span>
                    <span>VOCÊ</span>
                    <span>CHEGOU</span>
                    <span>ATÉ</span>
                  </p>
                  <p className="flex justify-between">
                    <span>AQUI,</span>
                    <span>DEVE</span>
                    <span>QUERER</span>
                  </p>
                  <p className="flex items-baseline justify-between">
                    <span>SABER.</span>
                    <span className="shrink-0 font-mono text-[0.68em] font-bold tracking-normal text-[var(--woody-ink)]/55">
                      // 001
                    </span>
                  </p>
                </div>
              </div>

              {/* Título */}
              <div className="min-w-0 md:col-span-8 md:col-start-5 md:row-start-1 lg:col-span-7 lg:col-start-5">
                <h2 className="font-display text-right text-[clamp(2.8rem,9vw,7rem)] font-bold leading-[0.9] tracking-[-0.025em] text-[var(--woody-ink)]">
                  O que
                  <br />é<br />
                  Woody?
                </h2>
              </div>

              {/* Corpo — abaixo do título */}
              <div className="min-w-0 md:col-span-8 md:col-start-5 md:row-start-2 lg:col-span-7 lg:col-start-5">
                <div className="ml-auto mt-8 max-w-[min(100%,52rem)] space-y-3 text-justify text-[1rem] leading-[1.38] text-[var(--woody-ink)] md:mt-10 md:max-w-[50rem] md:text-[1.05rem] md:leading-[1.4]">
                  {whatIsWoody.paragraphs.map((p) => (
                    <p key={p.slice(0, 28)}>{p}</p>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
