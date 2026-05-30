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
    <div className="bg-white">
      {/*
        Foto hero.
        Mobile: faixa estreita (160px) com foco nos olhos — pouca boca visível.
        Desktop: altura proporcional à viewport (preservado).
      */}
      <div className="w-full overflow-hidden h-[160px] md:h-[min(58svh,540px)]">
        <img
          src={INSTITUTIONAL_HERO_WHAT_IS_WOODY}
          alt="Composição visual associada à identidade Woody."
          className={[
            "h-full w-full object-cover brightness-[1.2]",
            /* Mobile: centraliza nos olhos, corta boca */
            "object-[center_22%]",
            /* Desktop: posição editorial original */
            "md:object-[74%_38%]",
          ].join(" ")}
          decoding="async"
        />
      </div>

      {/* Conteúdo editorial */}
      <div className="px-[var(--layout-gutter)] pb-10 pt-5 md:pb-24 md:pt-10">
        <div className="mx-auto max-w-[var(--layout-max-width)]">
          {!embedInLanding && (
            <div className="mb-10">
              <InstitutionalBackLink />
            </div>
          )}

          <ScrollReveal enabled={motion} yOffset={14}>
            <div className="grid grid-cols-1 md:grid-cols-12 md:gap-x-10 lg:gap-x-14">

              {/*
                Wrapper mobile: flex-row — label à esquerda, título à direita na mesma linha.
                Desktop: md:[display:contents] torna o wrapper transparente para o grid,
                cada filho vira célula direta do grid-cols-12 (comportamento original preservado).
              */}
              <div className="flex items-start gap-3 md:[display:contents]">

                {/* Rótulo editorial */}
                <div className="shrink-0 pt-1 md:col-span-4 md:row-start-1 md:flex md:items-center md:pl-8 lg:col-span-4 lg:pl-10">

                  {/* Mobile: coluna estreita e discreta ao lado do título */}
                  <div className="md:hidden w-[3.8rem]">
                    <p className="font-heading text-[0.55rem] font-black uppercase leading-[1.35] tracking-[0.04em] text-[var(--woody-ink)]">
                      SE<br />VOCÊ<br />CHEGOU<br />ATÉ<br />AQUI,<br />DEVE<br />QUERER<br />SABER.
                    </p>
                    <p className="mt-1 font-mono text-[0.48rem] font-bold tracking-normal text-[var(--woody-ink)]/50">
                      // 001
                    </p>
                  </div>

                  {/* Desktop: label editorial completo com justify-between (preservado) */}
                  <div className="hidden md:block w-full max-w-[min(100%,21rem)] font-heading text-[clamp(1.05rem,2.8vw,1.55rem)] font-black uppercase leading-[1.06] tracking-[0.02em] text-[var(--woody-ink)] md:max-w-[23rem]">
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

                {/* Título — mobile: flex-1 para ocupar o espaço restante ao lado do label */}
                <div className="flex-1 min-w-0 md:flex-none md:col-span-8 md:col-start-5 md:row-start-1 lg:col-span-7 lg:col-start-5">
                  <h2 className="font-display text-right leading-[0.9] tracking-[-0.025em] text-[var(--woody-ink)] font-normal
                    text-[clamp(2rem,11.5vw,3rem)]
                    md:text-[clamp(2.8rem,9vw,7rem)]">
                    O que
                    <br />é<br />
                    Woody?
                  </h2>
                </div>

              </div>{/* /wrapper mobile */}

              {/* Corpo — ocupa a coluna do título */}
              <div className="min-w-0 md:col-span-8 md:col-start-5 md:row-start-2 lg:col-span-7 lg:col-start-5">
                <div className="ml-auto max-w-[min(100%,52rem)] space-y-3 text-[var(--woody-ink)]
                  mt-4 text-[0.9rem] leading-[1.55] text-left
                  md:mt-10 md:max-w-[50rem] md:text-[1.25rem] md:leading-[1.4] md:text-justify">
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
