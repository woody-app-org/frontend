import { mission } from "../institutional/content";
import { InstitutionalBackLink } from "../institutional/components/InstitutionalBackLink";
import { INSTITUTIONAL_HERO_NOT_ALLOWED } from "../institutional/institutionalMedia";
import { ScrollReveal } from "../motion/ScrollReveal";

export interface MissionNarrativeSectionProps {
  embedInLanding?: boolean;
}

export function MissionNarrativeSection({ embedInLanding = false }: MissionNarrativeSectionProps) {
  const motion = embedInLanding;

  return (
    <div className="bg-white px-[var(--layout-gutter)] py-12 md:py-24">
      <div className="mx-auto max-w-[var(--layout-max-width)]">
        {!embedInLanding && (
          <div className="mb-10">
            <InstitutionalBackLink />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-start md:gap-x-10 md:gap-y-0 lg:gap-x-14">

          {/*
            Coluna esquerda — textos.
            Mobile: aparece depois da imagem (order-2).
            Desktop: coluna esquerda original (preservado).
          */}
          <ScrollReveal
            enabled={motion}
            yOffset={16}
            className="max-md:order-2 md:col-span-4 md:pl-8 lg:col-span-4 lg:pl-10"
          >
            <div className="flex flex-col items-start">

              {/* NOSSA MISSÃO + PRINCIPAL — desktop only (no mobile aparece sobre a foto) */}
              <div className="hidden md:flex flex-col items-center">
                <p className="text-center font-heading font-black uppercase leading-[1.12] tracking-[0.05em] text-[var(--woody-ink)]
                  text-[clamp(2rem,5.5vw,3.75rem)]">
                  NOSSA
                  <br />
                  MISSÃO
                </p>
                <p className="mt-4 font-heading font-black uppercase text-[var(--woody-ink)]
                  text-[clamp(0.82rem,2.1vw,1.12rem)] tracking-[0.26em] leading-[1.5] [writing-mode:vertical-rl]">
                  PRINCIPAL
                </p>
              </div>

              {/*
                Mobile: coluna centralizada — PRINCIPAL vertical no centro,
                lead text abaixo também centralizado como coluna.
              */}
              <div className="flex w-full flex-col items-center gap-5 md:hidden mt-2">
                {/* PRINCIPAL — vertical, centralizado */}
                <p className="font-heading font-black uppercase text-[var(--woody-ink)]
                  [writing-mode:vertical-rl] text-[1.1rem] tracking-[0.26em] leading-[1.5]">
                  PRINCIPAL
                </p>
                {/* Lead text — coluna centralizada, texto à esquerda */}
                <p className="text-left font-heading font-extrabold uppercase leading-[1.22] tracking-[0.012em] text-[var(--woody-ink)]
                  text-[0.85rem] max-w-[16rem]">
                  {mission.lead}
                </p>
              </div>

              {/* Lead text — desktop only */}
              <p className="hidden md:block text-left font-heading font-extrabold uppercase leading-[1.22] tracking-[0.012em] text-[var(--woody-ink)]
                mt-12 w-[13rem] text-[clamp(1.1rem,2.75vw,1.4rem)] sm:w-[15rem] lg:w-[17rem]">
                {mission.lead}
              </p>

              {!embedInLanding && mission.body.length > 0 && (
                <div className="mt-8 w-full max-w-[11.5rem] space-y-5 text-left text-[0.95rem] leading-[1.65] text-[var(--woody-ink)] sm:max-w-[12.5rem] lg:max-w-[13.5rem]">
                  {mission.body.map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                </div>
              )}
            </div>
          </ScrollReveal>

          {/*
            Coluna direita — imagem.
            Mobile: aparece primeiro (order-1) e carrega "NOSSA MISSÃO" sobreposto.
            Desktop: coluna direita original, sem overlay (preservado).
          */}
          <ScrollReveal
            enabled={motion}
            delayMs={100}
            yOffset={12}
            className="max-md:order-1 md:col-span-8 md:col-start-5 lg:col-span-7 lg:col-start-5 lg:-mr-4 xl:-mr-8"
          >
            <div>
              <div className="relative overflow-hidden lg:w-[calc(100%+2.5rem)] xl:w-[calc(100%+4rem)]">
                <img
                  src={INSTITUTIONAL_HERO_NOT_ALLOWED}
                  alt="Diversidade e comunidade Woody."
                  className="w-full object-cover object-[center_35%]"
                  style={{ aspectRatio: "3/2" }}
                  decoding="async"
                />

                {/* "NOSSA MISSÃO" sobreposto — mobile only */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center md:hidden">
                  <p
                    className="font-baron font-black uppercase text-center leading-[1.06] tracking-[0.05em] text-white
                      text-[clamp(2.6rem,13vw,3.8rem)]"
                    style={{
                      textShadow:
                        "0 0 20px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.14)",
                    }}
                  >
                    NOSSA
                    <br />
                    MISSÃO
                  </p>
                </div>

                {/* // 002 dentro da imagem — mobile only, canto inferior direito */}
                <p className="pointer-events-none absolute bottom-3 right-4 font-mono text-[0.78rem] font-semibold text-[var(--woody-ink)]/55 md:hidden">
                  // 002
                </p>
              </div>

              {/* // 002 fora da imagem — desktop only */}
              <p className="mt-3 hidden text-left font-mono text-sm font-semibold text-[var(--woody-ink)]/38 md:block">
                // 002
              </p>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </div>
  );
}
