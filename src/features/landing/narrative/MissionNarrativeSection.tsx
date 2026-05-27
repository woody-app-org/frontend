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
    <div className="bg-white px-[var(--layout-gutter)] py-16 md:py-24">
      <div className="mx-auto max-w-[var(--layout-max-width)]">
        {!embedInLanding && (
          <div className="mb-10">
            <InstitutionalBackLink />
          </div>
        )}

        <div className="grid grid-cols-1 gap-14 md:grid-cols-12 md:items-start md:gap-x-10 lg:gap-x-14">
          {/* Coluna esquerda — alinhada à seção «O que é Woody» */}
          <ScrollReveal enabled={motion} yOffset={16} className="md:col-span-4 md:pl-8 lg:col-span-4 lg:pl-10">
            <div className="flex flex-col items-start">
              <div className="flex flex-col items-center">
                <p className="text-center font-heading text-[clamp(2rem,5.5vw,3.75rem)] font-black uppercase leading-[1.12] tracking-[0.05em] text-[var(--woody-ink)]">
                  NOSSA
                  <br />
                  MISSÃO
                </p>
                <p className="mt-3 font-heading text-[clamp(0.82rem,2.1vw,1.12rem)] font-black uppercase tracking-[0.26em] text-[var(--woody-ink)] [writing-mode:vertical-rl] md:mt-4">
                  PRINCIPAL
                </p>
              </div>

              <p className="mt-10 w-[13rem] text-left font-heading text-[clamp(1.1rem,2.75vw,1.4rem)] font-extrabold uppercase leading-[1.22] tracking-[0.012em] text-[var(--woody-ink)] sm:w-[15rem] md:mt-12 lg:w-[17rem]">
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

          {/* Coluna direita: foto horizontal + marcador abaixo */}
          <ScrollReveal
            enabled={motion}
            delayMs={100}
            yOffset={12}
            className="md:col-span-8 md:col-start-5 lg:col-span-7 lg:col-start-5 lg:-mr-4 xl:-mr-8"
          >
            <div>
              <div className="overflow-hidden lg:w-[calc(100%+2.5rem)] xl:w-[calc(100%+4rem)]">
                <img
                  src={INSTITUTIONAL_HERO_NOT_ALLOWED}
                  alt="Diversidade e comunidade Woody."
                  className="w-full object-cover object-[center_35%]"
                  style={{ aspectRatio: "3/2" }}
                  decoding="async"
                />
              </div>
              <p className="mt-3 text-left font-mono text-sm font-semibold text-[var(--woody-ink)]/38">
                // 002
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
