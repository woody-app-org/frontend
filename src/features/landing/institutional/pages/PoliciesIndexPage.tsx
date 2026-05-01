import {
  policiesIndexIntro,
  policyAccess,
  policyBan,
  policyConfidentiality,
} from "../content";
import { InstitutionalBackLink } from "../components/InstitutionalBackLink";
import { InstitutionalPolicyCard } from "../components/InstitutionalPolicyCard";
import { INSTITUTIONAL_PATHS } from "../routes";

export function PoliciesIndexPage() {
  return (
    <main className="bg-[#e5e7eb] px-[var(--layout-gutter)] pb-24 pt-10 md:pt-14">
      <div className="mx-auto max-w-[var(--layout-max-width)]">
        <InstitutionalBackLink />

        <header className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#6b7280]">Woody</p>
          <h1 className="mt-3 font-sans text-[clamp(1.75rem,4vw,2.65rem)] font-extrabold uppercase leading-[1.05] tracking-[0.04em] text-[var(--woody-ink)]">
            Políticas
          </h1>
          <p className="mt-5 max-w-xl font-serif text-[1.02rem] leading-relaxed text-[var(--woody-ink)]/85 md:text-[1.06rem]">
            {policiesIndexIntro}
          </p>
        </header>

        <div className="mt-14 flex flex-col gap-10 md:gap-12 lg:flex-row lg:items-stretch lg:justify-between lg:gap-8">
          <InstitutionalPolicyCard
            badge={policyConfidentiality.badge}
            title={policyConfidentiality.title}
            excerpt={policyConfidentiality.excerpt}
            to={INSTITUTIONAL_PATHS.politicaConfidencialidade}
            className="lg:flex-1"
          />
          <InstitutionalPolicyCard
            badge={policyAccess.badge}
            title={policyAccess.title}
            excerpt={policyAccess.excerpt}
            to={INSTITUTIONAL_PATHS.politicaAcesso}
            className="lg:flex-1"
          />
          <InstitutionalPolicyCard
            badge={policyBan.badge}
            title={policyBan.title}
            excerpt={policyBan.excerpt}
            to={INSTITUTIONAL_PATHS.evitarBanimento}
            className="lg:flex-1"
          />
        </div>
      </div>
    </main>
  );
}
