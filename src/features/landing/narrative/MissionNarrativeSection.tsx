import { useState } from "react";
import { mission } from "../institutional/content";
import { InstitutionalBackLink } from "../institutional/components/InstitutionalBackLink";
import { InstitutionalPrimaryCta } from "../institutional/components/InstitutionalPrimaryCta";
import { INSTITUTIONAL_PATHS } from "../institutional/routes";
import { ScrollReveal } from "../motion/ScrollReveal";

export interface MissionNarrativeSectionProps {
  embedInLanding?: boolean;
}

export function MissionNarrativeSection({ embedInLanding = false }: MissionNarrativeSectionProps) {
  const [expanded, setExpanded] = useState(false);

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
            <h2 className="font-heading text-balance text-[clamp(1.85rem,4.5vw,2.85rem)] font-bold leading-[1.05] tracking-[-0.02em] text-[#8dbf43]">
              {mission.title}
            </h2>

            <div className="mt-10 space-y-6 text-[1.08rem] leading-[1.78] text-[var(--woody-ink)] md:text-[1.14rem]">
              <p className="font-editorial max-w-prose text-pretty font-normal leading-[1.8]">{mission.lead}</p>
              {expanded
                ? mission.body.map((p) => (
                    <p key={p.slice(0, 24)} className="font-normal">
                      {p}
                    </p>
                  ))
                : null}
            </div>

            <div className="mt-12">
              <InstitutionalPrimaryCta
                variant="limeSolid"
                showChevron={false}
                onClick={() => setExpanded((e) => !e)}
                className="border border-[#6a9a38]/90 bg-gradient-to-b from-[#a5d45c] to-[#8dbf43] hover:from-[#b0dc65] hover:to-[#9ad154]"
              >
                {expanded ? "LER MENOS" : "LER MAIS"}
              </InstitutionalPrimaryCta>
            </div>

            {!embedInLanding ? (
              <div className="mt-14 flex flex-wrap gap-3 border-t border-black/[0.06] pt-10">
                <InstitutionalPrimaryCta to={INSTITUTIONAL_PATHS.oQueE} variant="dark">
                  O que é a Woody?
                </InstitutionalPrimaryCta>
                <InstitutionalPrimaryCta to={INSTITUTIONAL_PATHS.hub} variant="ghost">
                  Voltar ao índice
                </InstitutionalPrimaryCta>
              </div>
            ) : null}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
