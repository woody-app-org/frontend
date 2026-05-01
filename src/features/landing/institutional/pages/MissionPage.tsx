import { useState } from "react";
import { mission } from "../content";
import { InstitutionalBackLink } from "../components/InstitutionalBackLink";
import { InstitutionalPrimaryCta } from "../components/InstitutionalPrimaryCta";
import { INSTITUTIONAL_PATHS } from "../routes";

export function MissionPage() {
  const [expanded, setExpanded] = useState(false);

  return (
    <main className="min-h-[min(88svh,900px)] bg-[#5b7a32] px-[var(--layout-gutter)] py-14 md:py-20">
      <div className="mx-auto flex max-w-[var(--layout-max-width)] flex-col items-stretch justify-center md:min-h-[calc(88svh-7rem)]">
        <InstitutionalBackLink className="!mb-8 !text-white/70 hover:!text-white md:!mb-10" />

        <div className="mx-auto w-full max-w-3xl rounded-[2rem] bg-white px-8 py-12 shadow-[0_32px_90px_-40px_rgba(0,0,0,0.45)] md:px-14 md:py-16">
          <h1 className="font-sans text-[clamp(1.85rem,4.5vw,2.85rem)] font-extrabold leading-[1.05] tracking-[-0.02em] text-[#8dbf43]">
            {mission.title}
          </h1>

          <div className="mt-10 space-y-6 font-serif text-[1.08rem] font-normal leading-[1.78] text-[var(--woody-ink)] md:text-[1.14rem]">
            <p>{mission.lead}</p>
            {expanded ? (
              mission.body.map((p) => <p key={p.slice(0, 24)}>{p}</p>)
            ) : null}
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
            <InstitutionalPrimaryCta to={INSTITUTIONAL_PATHS.oQueE} variant="dark">
              O que é a Woody?
            </InstitutionalPrimaryCta>
            <InstitutionalPrimaryCta to={INSTITUTIONAL_PATHS.hub} variant="ghost">
              Voltar ao índice
            </InstitutionalPrimaryCta>
          </div>
        </div>
      </div>
    </main>
  );
}
