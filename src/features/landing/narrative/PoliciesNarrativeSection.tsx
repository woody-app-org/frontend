import { Link } from "react-router-dom";
import {
  policyAccess,
  policyBan,
  policyConfidentiality,
  policiesIndexIntro,
} from "../institutional/content";
import { InstitutionalBackLink } from "../institutional/components/InstitutionalBackLink";
import { INSTITUTIONAL_PATHS } from "../institutional/routes";
import { INSTITUTIONAL_POLICIES_EDITORIAL } from "../institutional/institutionalMedia";
import { ScrollReveal } from "../motion/ScrollReveal";
import { cn } from "@/lib/utils";

export interface PoliciesNarrativeSectionProps {
  embedInLanding?: boolean;
}

interface PolicyDoc {
  title: string;
  badge: string;
  excerpt: string;
}

interface PolicyCircleProps {
  title: string;
  badge: string;
  excerpt: string;
  to: string;
  className?: string;
}

const editorialVerticalTextClasses =
  "font-heading text-[1.3rem] font-extrabold uppercase leading-[1.5] tracking-[0.22em] text-[var(--woody-ink)] [writing-mode:vertical-rl]";

// Círculo padrão — usado no desktop e na versão tablet empilhada
function PolicyCircle({ title, badge, excerpt, to, className }: PolicyCircleProps) {
  return (
    <Link
      to={to}
      className={cn(
        "group flex flex-col items-center justify-center rounded-full border border-[var(--woody-ink)]/22 bg-transparent text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#556b2f]/40",
        "p-8",
        "md:p-12 lg:p-16",
        className,
      )}
    >
      <p className="font-extrabold uppercase leading-snug text-[var(--woody-ink)] text-[0.85rem] tracking-[0.13em] md:text-[0.9rem] md:tracking-[0.15em] lg:text-[0.98rem]">
        {title}
      </p>
      <p className="mt-2 font-mono font-semibold text-[var(--woody-ink)]/40 text-[0.8rem] tracking-[0.15em] md:text-[0.85rem] md:tracking-[0.18em] lg:text-[0.9rem]">
        # {badge}
      </p>
      <p className="mt-5 line-clamp-5 leading-[1.68] text-[var(--woody-ink)] text-[1.05rem] md:mt-7 md:text-[1.22rem] lg:text-[1.31rem]">
        {excerpt}
      </p>
      <span className="mt-6 inline-flex items-center rounded-md border border-[#556b2f] font-bold uppercase tracking-[0.14em] text-[#556b2f] transition-colors group-hover:bg-[#556b2f] group-hover:text-white px-5 py-2.5 text-[0.85rem] md:mt-8 md:px-7 md:py-3 md:text-[0.9rem] lg:text-[0.98rem]">
        LER MAIS
      </span>
    </Link>
  );
}

// Círculo miniaturizado — usado apenas no layout mobile sobreposto
function MiniPolicyCircle({ doc, to }: { doc: PolicyDoc; to: string }) {
  return (
    <Link
      to={to}
      className="flex size-[245px] flex-col items-center justify-center overflow-hidden rounded-full border border-[var(--woody-ink)]/22 bg-transparent p-5 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#556b2f]/40"
    >
      <p className="text-[0.68rem] font-extrabold uppercase leading-snug tracking-[0.12em] text-[var(--woody-ink)]">
        {doc.title}
      </p>
      <p className="mt-1.5 font-mono text-[0.6rem] font-semibold tracking-[0.14em] text-[var(--woody-ink)]/40">
        # {doc.badge}
      </p>
      <p className="mt-3 line-clamp-4 text-[0.8rem] leading-[1.5] text-[var(--woody-ink)]">
        {doc.excerpt}
      </p>
      {/* Botão sempre preenchido no mobile — sem depender de hover */}
      <span className="mt-3 inline-flex items-center rounded-md bg-[#556b2f] px-4 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white">
        LER MAIS
      </span>
    </Link>
  );
}

export function PoliciesNarrativeSection({ embedInLanding = false }: PoliciesNarrativeSectionProps) {
  const motion = embedInLanding;

  return (
    <div className="relative overflow-hidden bg-white">
      <div className="px-[var(--layout-gutter)] py-12 md:py-24">
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

          {/*
            ── MOBILE (< 768px): círculos sobrepostos miniaturizados ──────────────
            Recria o layout do desktop em escala reduzida (~0.39×).
            Círculos: 245px | Foto: 168×215px
            Posições calculadas proporcionalmente ao desktop (625px circles).
          */}
          <ScrollReveal enabled={motion} yOffset={10}>
            <div className="relative min-h-[740px] overflow-hidden md:hidden">

              {/*
                Posições escalonadas para dar mais respiro entre foto e círculos.
                Círculo 1: 0–245px | Foto: 248–468px | Círculo 2: 246–491px
                Círculo 3: 476–721px
              */}

              {/* Foto editorial — no vão entre círculos #01 e #03 */}
              <div className="absolute left-0 top-[248px] z-0 h-[220px] w-[168px] overflow-hidden">
                <img
                  src={INSTITUTIONAL_POLICIES_EDITORIAL}
                  alt=""
                  aria-hidden
                  className="block size-full object-cover object-[center_32%]"
                  decoding="async"
                />
              </div>

              {/* "LEITURA BREVE" — topo direita, entre o círculo 1 e a borda */}
              <div className="absolute right-1 top-8 z-20">
                <p className="font-heading text-[0.6rem] font-extrabold uppercase leading-[1.5] tracking-[0.18em] text-[var(--woody-ink)] [writing-mode:vertical-rl]">
                  LEITURA
                  <br />
                  BREVE
                </p>
              </div>

              {/* Círculo 1 — topo esquerdo */}
              <div className="absolute left-0 top-5 z-10">
                <MiniPolicyCircle
                  doc={policyConfidentiality}
                  to={INSTITUTIONAL_PATHS.politicaConfidencialidade}
                />
              </div>

              {/* Círculo 2 — mais à direita */}
              <div className="absolute left-[150px] top-[246px] z-10">
                <MiniPolicyCircle
                  doc={policyAccess}
                  to={INSTITUTIONAL_PATHS.politicaAcesso}
                />
              </div>

              {/* Círculo 3 — título encurtado para não cortar no mobile */}
              <div className="absolute left-0 top-[460px] z-10">
                <MiniPolicyCircle
                  doc={{ ...policyBan, title: "Banimentos na Woody" }}
                  to={INSTITUTIONAL_PATHS.evitarBanimento}
                />
              </div>

              {/* Texto vertical decorativo — lado direito inferior */}
              <div className="absolute right-1 top-[520px] z-20">
                <p className="font-heading text-[0.6rem] font-extrabold uppercase leading-[1.5] tracking-[0.18em] text-[var(--woody-ink)] [writing-mode:vertical-rl]">
                  SE TODO MUNDO FIZER
                  <br />
                  SUA PARTE TEREMOS
                  <br />
                  A MELHOR EXPERIÊNCIA
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/*
            ── TABLET (768px–1023px): círculos empilhados com foto ──────────────
            Layout vertical com foto intercalada entre políticas.
          */}
          <div className="hidden md:flex flex-col gap-14 lg:hidden">
            <ScrollReveal enabled={motion} yOffset={14}>
              <PolicyCircle
                title={policyConfidentiality.title}
                badge={policyConfidentiality.badge}
                excerpt={policyConfidentiality.excerpt}
                to={INSTITUTIONAL_PATHS.politicaConfidencialidade}
                className="mx-auto aspect-square w-full max-w-[440px]"
              />
            </ScrollReveal>

            <ScrollReveal enabled={motion} delayMs={60} yOffset={12}>
              <div className="mx-auto w-[78%] overflow-hidden">
                <img
                  src={INSTITUTIONAL_POLICIES_EDITORIAL}
                  alt=""
                  aria-hidden
                  className="w-full object-cover object-[center_32%]"
                  style={{ aspectRatio: "3/4" }}
                  decoding="async"
                />
              </div>
            </ScrollReveal>

            <ScrollReveal enabled={motion} delayMs={80} yOffset={14}>
              <PolicyCircle
                title={policyAccess.title}
                badge={policyAccess.badge}
                excerpt={policyAccess.excerpt}
                to={INSTITUTIONAL_PATHS.politicaAcesso}
                className="mx-auto aspect-square w-full max-w-[440px]"
              />
            </ScrollReveal>

            <ScrollReveal enabled={motion} delayMs={80} yOffset={14}>
              <PolicyCircle
                title={policyBan.title}
                badge={policyBan.badge}
                excerpt={policyBan.excerpt}
                to={INSTITUTIONAL_PATHS.evitarBanimento}
                className="mx-auto aspect-square w-full max-w-[440px]"
              />
            </ScrollReveal>
          </div>

          {/*
            ── DESKTOP (≥ 1024px): círculos sobrepostos — preservado integralmente ──
          */}
          <div className="relative hidden min-h-[1680px] lg:block lg:pl-10">
            <div className="absolute left-0 top-[519px] z-0 h-[563px] w-[450px] overflow-hidden">
              <ScrollReveal enabled={motion} delayMs={140} yOffset={12} className="size-full">
                <img
                  src={INSTITUTIONAL_POLICIES_EDITORIAL}
                  alt=""
                  aria-hidden
                  className="block size-full object-cover object-[center_32%]"
                  decoding="async"
                />
              </ScrollReveal>
            </div>

            <div className="absolute left-0 top-0 z-10">
              <ScrollReveal enabled={motion} yOffset={16}>
                <PolicyCircle
                  title={policyConfidentiality.title}
                  badge={policyConfidentiality.badge}
                  excerpt={policyConfidentiality.excerpt}
                  to={INSTITUTIONAL_PATHS.politicaConfidencialidade}
                  className="size-[625px]"
                />
              </ScrollReveal>
            </div>

            <div className="absolute left-[388px] top-[510px] z-10">
              <ScrollReveal enabled={motion} delayMs={100} yOffset={16}>
                <PolicyCircle
                  title={policyAccess.title}
                  badge={policyAccess.badge}
                  excerpt={policyAccess.excerpt}
                  to={INSTITUTIONAL_PATHS.politicaAcesso}
                  className="size-[625px]"
                />
              </ScrollReveal>
            </div>

            <div className="absolute left-0 top-[1025px] z-10">
              <ScrollReveal enabled={motion} delayMs={180} yOffset={16}>
                <PolicyCircle
                  title={policyBan.title}
                  badge={policyBan.badge}
                  excerpt={policyBan.excerpt}
                  to={INSTITUTIONAL_PATHS.evitarBanimento}
                  className="size-[625px]"
                />
              </ScrollReveal>
            </div>

            <div className="absolute right-[8%] top-[120px] z-10 flex justify-center">
              <p className={editorialVerticalTextClasses}>
                LEITURA
                <br />
                BREVE
              </p>
            </div>

            <div className="absolute right-[8%] top-[1240px] z-10 flex justify-center">
              <p className={editorialVerticalTextClasses}>
                SE TODO MUNDO FIZER
                <br />
                SUA PARTE TEREMOS
                <br />
                A MELHOR EXPERIÊNCIA
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
