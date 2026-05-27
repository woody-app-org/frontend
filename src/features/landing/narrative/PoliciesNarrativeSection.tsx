import { Link } from "react-router-dom";
import {
  policyAccess,
  policyBan,
  policyConfidentiality,
  policiesIndexIntro,
} from "../institutional/content";
import { InstitutionalBackLink } from "../institutional/components/InstitutionalBackLink";
import { INSTITUTIONAL_PATHS } from "../institutional/routes";
import { INSTITUTIONAL_HERO_NOT_ALLOWED } from "../institutional/institutionalMedia";
import { ScrollReveal } from "../motion/ScrollReveal";
import { cn } from "@/lib/utils";

export interface PoliciesNarrativeSectionProps {
  embedInLanding?: boolean;
}

interface PolicyCircleProps {
  title: string;
  badge: string;
  excerpt: string;
  to: string;
  className?: string;
}

function PolicyCircle({ title, badge, excerpt, to, className }: PolicyCircleProps) {
  return (
    <Link
      to={to}
      className={cn(
        "group flex flex-col items-center justify-center rounded-full border border-[var(--woody-ink)]/20 p-10 text-center transition-[border-color] hover:border-[var(--woody-ink)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#556b2f]/40 md:p-12",
        className,
      )}
    >
      <p className="text-[0.62rem] font-extrabold uppercase leading-snug tracking-[0.15em] text-[var(--woody-ink)]">
        {title}
      </p>
      <p className="mt-1.5 font-mono text-[0.58rem] font-semibold tracking-[0.18em] text-[var(--woody-ink)]/40">
        # {badge}
      </p>
      <p className="mt-5 line-clamp-5 text-[0.88rem] leading-[1.68] text-[var(--woody-ink)]">{excerpt}</p>
      <span className="mt-6 inline-flex items-center rounded-md border border-[#556b2f] px-5 py-2 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#556b2f] transition-colors group-hover:bg-[#556b2f] group-hover:text-white">
        LER MAIS
      </span>
    </Link>
  );
}

export function PoliciesNarrativeSection({ embedInLanding = false }: PoliciesNarrativeSectionProps) {
  const motion = embedInLanding;

  return (
    <div className="relative overflow-hidden bg-white">
      {/* "LEITURA BREVE" vertical — direita */}
      <div className="absolute right-3 top-1/3 z-10 hidden -translate-y-1/2 md:flex md:right-4 lg:right-5">
        <p className="font-heading text-[0.48rem] font-bold uppercase tracking-[0.3em] text-[var(--woody-ink)]/35 [writing-mode:vertical-rl] md:text-[0.52rem]">
          LEITURA BREVE
        </p>
      </div>

      <div className="px-[var(--layout-gutter)] py-16 md:py-20">
        <div className="mx-auto max-w-[var(--layout-max-width)]">
          {!embedInLanding && (
            <>
              <InstitutionalBackLink className="mb-10" />
              <header className="mb-12 max-w-3xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#6b7280]">Woody</p>
                <h2 className="font-heading mt-3 text-balance text-[clamp(1.75rem,4vw,2.65rem)] font-bold uppercase leading-[1.05] tracking-[0.03em] text-[var(--woody-ink)]">
                  Políticas
                </h2>
                <p className="font-editorial mt-5 max-w-xl text-pretty text-[1.02rem] leading-relaxed text-[var(--woody-ink)]/85 md:text-[1.06rem]">
                  {policiesIndexIntro}
                </p>
              </header>
            </>
          )}

          {/* Mobile: empilhado */}
          <div className="flex flex-col gap-10 lg:hidden">
            {[
              { doc: policyConfidentiality, to: INSTITUTIONAL_PATHS.politicaConfidencialidade },
              { doc: policyAccess, to: INSTITUTIONAL_PATHS.politicaAcesso },
              { doc: policyBan, to: INSTITUTIONAL_PATHS.evitarBanimento },
            ].map(({ doc, to }, i) => (
              <ScrollReveal key={to} enabled={motion} delayMs={i * 80} yOffset={14}>
                <PolicyCircle
                  title={doc.title}
                  badge={doc.badge}
                  excerpt={doc.excerpt}
                  to={to}
                  className="mx-auto aspect-square w-full max-w-[360px]"
                />
              </ScrollReveal>
            ))}
          </div>

          {/* Desktop: círculos sobrepostos */}
          <div
            className="relative hidden lg:block"
            style={{ minHeight: "980px" }}
          >
            {/* Círculo 1 — topo esquerdo */}
            <div className="absolute" style={{ left: "0", top: "0" }}>
              <ScrollReveal enabled={motion} yOffset={16}>
                <PolicyCircle
                  title={policyConfidentiality.title}
                  badge={policyConfidentiality.badge}
                  excerpt={policyConfidentiality.excerpt}
                  to={INSTITUTIONAL_PATHS.politicaConfidencialidade}
                  className="h-[430px] w-[430px]"
                />
              </ScrollReveal>
            </div>

            {/* Círculo 2 — centro direito, sobrepõe círculo 1 */}
            <div className="absolute" style={{ right: "8%", top: "250px" }}>
              <ScrollReveal enabled={motion} delayMs={100} yOffset={16}>
                <PolicyCircle
                  title={policyAccess.title}
                  badge={policyAccess.badge}
                  excerpt={policyAccess.excerpt}
                  to={INSTITUTIONAL_PATHS.politicaAcesso}
                  className="h-[430px] w-[430px]"
                />
              </ScrollReveal>
            </div>

            {/* Foto P&B — esquerda, entre círculos 2 e 3 */}
            <div
              className="absolute overflow-hidden"
              style={{ left: "2%", top: "490px", width: "210px", height: "285px" }}
            >
              <ScrollReveal enabled={motion} delayMs={140} yOffset={12}>
                <img
                  src={INSTITUTIONAL_HERO_NOT_ALLOWED}
                  alt=""
                  aria-hidden
                  className="h-full w-full object-cover"
                  style={{ filter: "grayscale(100%)" }}
                  decoding="async"
                />
              </ScrollReveal>
            </div>

            {/* Círculo 3 — baixo esquerdo, sobrepõe círculo 2 */}
            <div className="absolute" style={{ left: "16%", top: "530px" }}>
              <ScrollReveal enabled={motion} delayMs={180} yOffset={16}>
                <PolicyCircle
                  title={policyBan.title}
                  badge={policyBan.badge}
                  excerpt={policyBan.excerpt}
                  to={INSTITUTIONAL_PATHS.evitarBanimento}
                  className="h-[430px] w-[430px]"
                />
              </ScrollReveal>
            </div>

            {/* Texto vertical direita — inferior */}
            <div className="absolute bottom-8 right-0 flex justify-end">
              <p className="font-heading text-[0.47rem] font-bold uppercase tracking-[0.3em] text-[var(--woody-ink)]/30 [writing-mode:vertical-rl]">
                SE TODO MUNDO FIZER SUA PARTE TEREMOS A MELHOR EXPERIÊNCIA
              </p>
            </div>
          </div>

          {/* Bloco cookies — apenas na página standalone */}
          {!embedInLanding && (
            <div className="mt-14 max-w-3xl">
              <div className="rounded-[1.5rem] border border-black/[0.08] bg-white px-6 py-6 shadow-sm md:px-8 md:py-7">
                <p className="font-sans text-sm font-bold uppercase tracking-[0.12em] text-[#6b7280]">
                  Política de Cookies e Tecnologias Locais
                </p>
                <p className="mt-3 text-[1.02rem] leading-relaxed text-[var(--woody-ink)]/88 md:text-[1.05rem]">
                  Um resumo simples de como a Woody trata dados no seu navegador neste momento - sem juridiquês
                  excessivo, mas com honestidade. Esta política explica o uso de cookies, armazenamento local, sessão,
                  recursos técnicos e terceiros necessários para a aplicação funcionar de forma segura e transparente.
                </p>
                <Link
                  to={INSTITUTIONAL_PATHS.privacidadeCookies}
                  className="mt-5 inline-flex items-center gap-2 font-sans text-sm font-semibold text-[#3d4a28] underline-offset-4 transition-colors hover:text-[var(--woody-ink)] hover:underline"
                >
                  Privacidade e cookies
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
