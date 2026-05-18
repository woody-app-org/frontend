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
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

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

        {!embedInLanding ? (
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
        ) : null}

        <div
          className={cn(
            "flex flex-col gap-10 md:gap-12 lg:flex-row lg:items-stretch lg:justify-between lg:gap-8",
            embedInLanding ? "mt-6 md:mt-8" : "mt-12 md:mt-14"
          )}
        >
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

        <ScrollReveal enabled={motion} delayMs={450} yOffset={12} className="mt-14 max-w-3xl">
          <div className="rounded-[1.5rem] border border-black/[0.08] bg-white/70 px-6 py-6 shadow-sm md:px-8 md:py-7">
            <p className="font-sans text-sm font-bold uppercase tracking-[0.12em] text-[#6b7280]">Política de Cookies e Tecnologias Locais</p>
            <p className="mt-3 font-serif text-[1.02rem] leading-relaxed text-[var(--woody-ink)]/88 md:text-[1.05rem]">
            Um resumo simples de como a Woody trata dados no seu navegador neste momento - sem juridiquês excessivo, mas com honestidade. Esta política explica o uso de cookies, armazenamento local, sessão, recursos técnicos e terceiros necessários para a aplicação funcionar de forma segura e transparente.
            </p>
            <Link
              to={INSTITUTIONAL_PATHS.privacidadeCookies}
              className="mt-5 inline-flex items-center gap-2 font-sans text-sm font-semibold text-[#3d4a28] underline-offset-4 transition-colors hover:text-[var(--woody-ink)] hover:underline"
            >
              Privacidade e cookies
              <span aria-hidden>→</span>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
