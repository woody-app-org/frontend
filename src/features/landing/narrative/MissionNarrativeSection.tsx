import { useState } from "react";
import { mission } from "../institutional/content";
import { InstitutionalBackLink } from "../institutional/components/InstitutionalBackLink";
import { InstitutionalPrimaryCta } from "../institutional/components/InstitutionalPrimaryCta";
import { INSTITUTIONAL_PATHS } from "../institutional/routes";
import { LANDING_NARRATIVE_IDS } from "../constants";
import { ScrollReveal } from "../motion/ScrollReveal";

export interface MissionNarrativeSectionProps {
  embedInLanding?: boolean;
}

export function MissionNarrativeSection({ embedInLanding = false }: MissionNarrativeSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const oQueLink = embedInLanding
    ? ({ href: `#${LANDING_NARRATIVE_IDS.oQueEWoody}` } as const)
    : ({ to: INSTITUTIONAL_PATHS.oQueE } as const);
  const extraLink = embedInLanding
    ? ({ href: `#${LANDING_NARRATIVE_IDS.politicas}` } as const)
    : ({ to: INSTITUTIONAL_PATHS.hub } as const);
  const extraLabel = embedInLanding ? "Políticas e QR" : "Voltar ao índice";

  const motion = embedInLanding;

  return (
    <div
      className={
        embedInLanding
          ? "bg-[#5b7a32] px-[var(--layout-gutter)] py-16 md:py-20"
          : "min-h-[min(88svh,900px)] bg-[#5b7a32] px-[var(--layout-gutter)] py-14 md:py-20"
      }
    >
      <div
        className={
          embedInLanding
            ? "mx-auto flex max-w-[var(--layout-max-width)] flex-col items-stretch"
            : "mx-auto flex max-w-[var(--layout-max-width)] flex-col items-stretch justify-center md:min-h-[calc(88svh-7rem)]"
        }
      >
        {!embedInLanding ? (
          <InstitutionalBackLink className="!mb-8 !text-white/70 hover:!text-white md:!mb-10" />
        ) : null}

        <ScrollReveal enabled={motion} yOffset={20}>
          <div className="mx-auto w-full max-w-3xl rounded-[2rem] bg-white px-8 py-12 shadow-[0_32px_90px_-40px_rgba(0,0,0,0.45)] md:px-14 md:py-16">
            <h2 className="font-sans text-[clamp(1.85rem,4.5vw,2.85rem)] font-extrabold leading-[1.05] tracking-[-0.02em] text-[#8dbf43]">
              {mission.title}
            </h2>

            <div className="mt-10 space-y-6 font-serif text-[1.08rem] font-normal leading-[1.78] text-[var(--woody-ink)] md:text-[1.14rem]">
              <p>{mission.lead}</p>
              {expanded ? mission.body.map((p) => <p key={p.slice(0, 24)}>{p}</p>) : null}
            </div>

            <div className="mt-12">
              <InstitutionalPrimaryCta
                variant="limeSolid"
                showChevron={false}
                onClick={() => setExpanded((e) => !e)}
              >
                {expanded ? "Ler menos" : "Ler mais"}
              </InstitutionalPrimaryCta>
            </div>

            <div className="mt-14 flex flex-wrap gap-3 border-t border-black/[0.06] pt-10">
              <InstitutionalPrimaryCta {...oQueLink} variant="dark">
                O que é a Woody?
              </InstitutionalPrimaryCta>
              <InstitutionalPrimaryCta {...extraLink} variant="ghost">
                {extraLabel}
              </InstitutionalPrimaryCta>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
