import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
/**
 * Hero editorial de alto impacto — tipografia display, acentos lime e composição tipo marca premium.
 * (Não compõe a landing principal actual; mantido para reutilização eventual.)
 */
export function LandingHero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-black/[0.06]">
      {/* Fundo: cal quente + ruído orgânico + limiar lime */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,#f8f6f1_0%,#ebe8df_42%,#f4f2ec_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45] mix-blend-multiply [background-image:radial-gradient(circle_at_1px_1px,rgba(10,10,10,0.04)_1px,transparent_0)] [background-size:24px_24px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-[20%] top-[-35%] h-[min(90vw,720px)] w-[min(90vw,720px)] rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(139,195,74,0.28),transparent_58%)] blur-[2px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-[linear-gradient(90deg,transparent,rgba(139,195,74,0.55),transparent)]"
        aria-hidden
      />

      <div className="relative mx-auto grid min-h-[min(92svh,920px)] max-w-[var(--layout-max-width)] grid-cols-1 content-center gap-14 px-[var(--layout-gutter)] py-14 md:gap-16 md:py-20 lg:grid-cols-12 lg:items-center lg:gap-10 lg:py-24">
        <div className="min-w-0 lg:col-span-6 xl:col-span-6">
          <div className="inline-flex items-center gap-3">
            <span className="h-px w-10 bg-[var(--woody-lime)]" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--woody-ink)]/55">
              Comunidades · contexto · pertencimento
            </p>
          </div>

          <h1 className="mt-8 font-serif text-[clamp(2.65rem,6.4vw,4.35rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-[var(--woody-ink)]">
            O teu espaço,
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">com conversa</span>
              <span
                className="absolute -bottom-1 left-0 right-0 z-0 h-[0.42em] rounded-sm bg-[var(--woody-lime)]/35"
                aria-hidden
              />
            </span>
            <br />
            <span className="text-[var(--woody-ink)]/88">que importa.</span>
          </h1>

          <p className="mt-8 max-w-[26rem] text-[1.05rem] font-medium leading-[1.65] text-[var(--woody-muted)] md:text-[1.125rem]">
            A Woody é uma rede social orientada por comunidades — pensada para mulheres encontrarem{" "}
            <span className="text-[var(--woody-ink)]">afinidade</span>,{" "}
            <span className="text-[var(--woody-ink)]">segurança</span> e{" "}
            <span className="text-[var(--woody-ink)]">ritmo</span> nas próprias conversas.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3 md:mt-12">
            <Button
              size="lg"
              className="h-[3.25rem] rounded-full bg-[var(--woody-ink)] px-8 text-[15px] font-semibold tracking-tight text-[var(--woody-lime)] shadow-[0_0_0_1px_rgba(139,195,74,0.42),0_0_40px_-8px_rgba(139,195,74,0.55),0_18px_48px_rgba(10,10,10,0.28)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:bg-black hover:shadow-[0_0_0_1px_rgba(139,195,74,0.55),0_0_52px_-6px_rgba(139,195,74,0.65),0_22px_56px_rgba(10,10,10,0.32)]"
              asChild
            >
              <Link to="/auth/onboarding/1" className="inline-flex items-center gap-2">
                Criar conta
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-[3.25rem] rounded-full border-[var(--woody-ink)]/14 bg-white/55 px-7 text-[15px] font-semibold tracking-tight text-[var(--woody-ink)] shadow-sm backdrop-blur-sm transition-colors hover:border-[var(--woody-lime)]/45 hover:bg-white/80"
              asChild
            >
              <Link to="/auth/login">Entrar</Link>
            </Button>
          </div>

          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-black/[0.08] pt-8 text-left md:mt-14">
            {[
              ["Comunidades", "públicas e privadas"],
              ["Direct", "em tempo real"],
              ["Pro", "criar e gerir"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--woody-muted)]">{k}</dt>
                <dd className="mt-1.5 text-sm font-semibold leading-snug text-[var(--woody-ink)]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:col-span-6 lg:mx-0 lg:max-w-none">
          <HeroOrganicSvg className="pointer-events-none absolute -left-[12%] top-[8%] hidden w-[55%] text-[var(--woody-lime)]/25 lg:block" />
          <LandingHeroVisual />
        </div>
      </div>
    </section>
  );
}

function HeroOrganicSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 320" fill="none" aria-hidden>
      <path
        d="M20 40C80 20 140 60 160 120C175 165 120 200 90 230C55 265 30 300 40 320"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M8 120C48 100 100 140 118 190C130 225 100 255 70 275"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );
}

function LandingHeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[440px] lg:max-w-[520px]">
      {/* Cartão de fundo — profundidade editorial */}
      <div
        className="absolute -right-4 top-10 hidden h-[78%] w-[88%] rounded-[1.5rem] border border-black/[0.06] bg-white/40 shadow-[0_32px_80px_rgba(10,10,10,0.08)] md:block lg:-right-6 lg:top-12"
        style={{ transform: "rotate(6deg)" }}
        aria-hidden
      />
      <div
        className="absolute -left-5 bottom-8 hidden h-[55%] w-[72%] rounded-[1.35rem] border border-[var(--woody-lime)]/25 bg-[var(--woody-ink)]/90 shadow-[0_24px_70px_rgba(10,10,10,0.35)] md:block"
        style={{ transform: "rotate(-7deg)" }}
        aria-hidden
      />

      <div className="relative rounded-[1.5rem] border border-black/[0.09] bg-white/90 p-1 shadow-[0_28px_90px_rgba(10,10,10,0.12)] ring-1 ring-black/[0.04] backdrop-blur-md md:p-1.5">
        <div className="absolute -right-2 -top-2 flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--woody-muted)] shadow-md md:-right-3 md:-top-3">
          <span className="size-1.5 rounded-full bg-[var(--woody-lime)] shadow-[0_0_0_3px_rgba(139,195,74,0.25)]" />
          Ao vivo
        </div>

        <div className="overflow-hidden rounded-[1.25rem] bg-[var(--woody-ink)] p-2 md:p-2.5">
          <div className="flex gap-2 md:gap-2.5">
            <div className="hidden w-[24%] shrink-0 flex-col gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 md:flex" aria-hidden>
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-full bg-gradient-to-br from-white/25 to-white/5" />
                <div className="h-2 flex-1 rounded-full bg-white/15" />
              </div>
              <div className="mt-1 h-px w-full bg-white/[0.08]" />
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-9 rounded-lg transition-colors",
                    i === 0
                      ? "border border-[var(--woody-lime)]/45 bg-[var(--woody-lime)]/12 shadow-[inset_0_0_0_1px_rgba(139,195,74,0.15)]"
                      : "bg-white/[0.04]"
                  )}
                />
              ))}
            </div>

            <div className="min-w-0 flex-1 space-y-2.5 rounded-xl bg-[var(--woody-main-surface)] p-3 md:p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/45">Para ti</p>
                  <div className="mt-1.5 h-2 w-24 rounded-full bg-black/10" />
                </div>
                <div className="flex size-9 items-center justify-center rounded-full bg-[var(--woody-lime)]/25 ring-2 ring-[var(--woody-lime)]/35">
                  <div className="size-2 rounded-full bg-[var(--woody-lime)]" />
                </div>
              </div>

              <div className="rounded-[1rem] border-l-[4px] border-[var(--woody-lime)] bg-white p-3.5 shadow-[0_12px_40px_rgba(10,10,10,0.06)] md:p-4">
                <div className="flex items-start gap-2.5">
                  <div className="size-9 shrink-0 rounded-full bg-gradient-to-br from-black/10 to-black/[0.04] ring-2 ring-white" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-black/14" />
                      <span className="rounded-full bg-[var(--woody-tag-bg)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--woody-tag-text)]">
                        Pro
                      </span>
                    </div>
                    <div className="h-2 w-full max-w-[14rem] rounded-full bg-black/8" />
                    <div className="h-2 w-[88%] rounded-full bg-black/5" />
                  </div>
                </div>
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {["Rotina suave", "Comunidade", "Lisboa"].map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-[var(--woody-tag-bg)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--woody-tag-text)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[1rem] border border-black/[0.06] bg-white/95 p-3.5 shadow-sm">
                <div className="h-2 w-32 rounded-full bg-black/10" />
                <div className="mt-2 h-2 w-full rounded-full bg-black/[0.05]" />
                <div className="mt-2 h-2 w-[72%] rounded-full bg-black/[0.04]" />
              </div>
            </div>
          </div>
        </div>

        <p className="px-2 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--woody-muted)]">
          Pré-visualização da experiência Woody
        </p>
      </div>
    </div>
  );
}
