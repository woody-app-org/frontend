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
    <div className="bg-[#f4f2ec] px-[var(--layout-gutter)] py-16 md:py-24">
      <div className="mx-auto max-w-[var(--layout-max-width)]">
        {!embedInLanding && (
          <div className="mb-10">
            <InstitutionalBackLink />
          </div>
        )}

        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:items-start lg:gap-16 xl:gap-20">
          {/* Coluna esquerda: cabeçalho + texto bold uppercase */}
          <ScrollReveal enabled={motion} yOffset={16}>
            <div className="flex items-start gap-5">
              <p className="font-heading text-[1rem] font-extrabold uppercase leading-[1.1] tracking-[0.07em] text-[var(--woody-ink)] md:text-[1.05rem]">
                NOSSA
                <br />
                MISSÃO
              </p>
              <p className="mt-0.5 self-stretch font-heading text-[0.5rem] font-bold uppercase tracking-[0.3em] text-[var(--woody-ink)]/45 [writing-mode:vertical-rl]">
                PRINCIPAL
              </p>
            </div>

            <p className="mt-8 font-heading text-[clamp(1rem,2.5vw,1.52rem)] font-extrabold uppercase leading-[1.38] tracking-[0.012em] text-[var(--woody-ink)]">
              {mission.lead}
            </p>

            {/* Corpo completo apenas na página standalone */}
            {!embedInLanding && mission.body.length > 0 && (
              <div className="mt-8 space-y-5 text-[1rem] leading-[1.78] text-[var(--woody-ink)]/80 md:text-[1.04rem]">
                {mission.body.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
            )}
          </ScrollReveal>

          {/* Coluna direita: foto com marcador */}
          <ScrollReveal enabled={motion} delayMs={100} yOffset={12}>
            <div className="relative overflow-hidden">
              <img
                src={INSTITUTIONAL_HERO_NOT_ALLOWED}
                alt="Diversidade e comunidade Woody."
                className="w-full object-cover"
                style={{ aspectRatio: "4/5" }}
                decoding="async"
              />
              <span className="absolute bottom-4 right-5 font-mono text-sm font-bold text-white/70">
                // 002
              </span>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
