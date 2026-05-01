import {
  policiesIndexIntro,
  policyAccess,
  policyBan,
  policyConfidentiality,
} from "../institutional/content";
import { InstitutionalBackLink } from "../institutional/components/InstitutionalBackLink";
import { InstitutionalPolicyCard } from "../institutional/components/InstitutionalPolicyCard";
import { INSTITUTIONAL_PATHS } from "../institutional/routes";
import { ScrollReveal } from "../motion/ScrollReveal";

export interface PoliciesNarrativeSectionProps {
  embedInLanding?: boolean;
}

const policyCards = [
  {
    doc: policyConfidentiality,
    to: INSTITUTIONAL_PATHS.politicaConfidencialidade,
  },
  {
    doc: policyAccess,
    to: INSTITUTIONAL_PATHS.politicaAcesso,
  },
  {
    doc: policyBan,
    to: INSTITUTIONAL_PATHS.evitarBanimento,
  },
] as const;

export function PoliciesNarrativeSection({ embedInLanding = false }: PoliciesNarrativeSectionProps) {
  const motion = embedInLanding;

  return (
    <div className="bg-[#e5e7eb] px-[var(--layout-gutter)] pb-20 pt-10 md:pb-24 md:pt-14">
      <div className="mx-auto max-w-[var(--layout-max-width)]">
        {!embedInLanding ? <InstitutionalBackLink /> : null}

        <header className="max-w-3xl">
          <ScrollReveal enabled={motion} yOffset={10}>
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#6b7280]">Woody</p>
          </ScrollReveal>
          <ScrollReveal enabled={motion} delayMs={70} yOffset={12}>
            <h2 className="mt-3 font-sans text-[clamp(1.75rem,4vw,2.65rem)] font-extrabold uppercase leading-[1.05] tracking-[0.04em] text-[var(--woody-ink)]">
              Políticas
            </h2>
          </ScrollReveal>
          <ScrollReveal enabled={motion} delayMs={130} yOffset={10}>
            <p className="mt-5 max-w-xl font-serif text-[1.02rem] leading-relaxed text-[var(--woody-ink)]/85 md:text-[1.06rem]">
              {policiesIndexIntro}
            </p>
          </ScrollReveal>
        </header>

        <div className="mt-12 flex flex-col gap-10 md:mt-14 md:gap-12 lg:flex-row lg:items-stretch lg:justify-between lg:gap-8">
          {policyCards.map(({ doc, to }, i) => (
            <ScrollReveal key={to} enabled={motion} delayMs={180 + i * 75} yOffset={16} className="lg:flex-1">
              <InstitutionalPolicyCard
                badge={doc.badge}
                title={doc.title}
                excerpt={doc.excerpt}
                to={to}
                className="h-full"
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
}
