import { LANDING_IDS } from "../constants";

/**
 * Faixa de produto escura + frames claros — contraste Woody (ink / off-white / lime).
 */
export function LandingShowcase() {
  return (
    <section
      id={LANDING_IDS.showcase}
      className="relative overflow-hidden border-b border-black/[0.06] bg-[var(--woody-ink)] py-24 text-white md:py-32"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.2] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:22px_22px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-[10%] top-0 h-[min(80vw,560px)] w-[min(80vw,560px)] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(139,195,74,0.18),transparent_60%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[var(--layout-max-width)] px-[var(--layout-gutter)]">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-white/50">
            <span className="h-px w-8 bg-[var(--woody-lime)]" aria-hidden />
            Produto
          </p>
          <h2 className="mt-5 font-serif text-[clamp(2rem,4vw,3.15rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-white">
            A interface como promessa.
          </h2>
          <p className="mt-6 text-[1.05rem] font-medium leading-relaxed text-white/65 md:text-lg">
            Preto profundo, superfícies claras e verde-lima como fio condutor — a mesma linguagem que vês dentro da
            Woody, agora como prova visual.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
          {/* Feed + layout desktop */}
          <div className="lg:col-span-7">
            <div
              className="relative origin-top transition-transform duration-500 hover:-translate-y-1"
              style={{ transform: "perspective(1200px) rotateX(2deg)" }}
            >
              <div className="absolute -inset-3 rounded-[1.75rem] bg-[var(--woody-lime)]/10 blur-2xl" aria-hidden />
              <div className="relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#eae8e2] shadow-[0_40px_100px_rgba(0,0,0,0.45)] ring-1 ring-white/10">
                <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] bg-[var(--woody-ink)] px-4 py-3 md:px-5">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-sm font-semibold tracking-tight text-white">
                      Woody<span className="text-[var(--woody-lime)]">.</span>
                    </span>
                    <span className="hidden h-4 w-px bg-white/15 sm:block" aria-hidden />
                    <span className="hidden text-[11px] font-medium uppercase tracking-[0.16em] text-white/45 sm:inline">
                      Feed
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="size-2 rounded-full bg-white/15" />
                    <span className="size-2 rounded-full bg-white/15" />
                    <span className="size-2 rounded-full bg-[var(--woody-lime)]" />
                  </div>
                </div>
                <div className="grid gap-3 bg-[var(--woody-main-surface)] p-4 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.2fr)] md:p-5">
                  <div className="hidden rounded-[1rem] border border-black/[0.06] bg-[var(--woody-ink)] p-3.5 md:block">
                    <div className="h-2 w-14 rounded-full bg-white/20" />
                    <div className="mt-4 space-y-2">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={
                            i === 1
                              ? "h-9 rounded-lg border border-[var(--woody-lime)]/40 bg-[var(--woody-lime)]/10"
                              : "h-9 rounded-lg bg-white/[0.06]"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-[1rem] border-l-[4px] border-[var(--woody-lime)] bg-white p-4 shadow-[0_16px_48px_rgba(10,10,10,0.08)]">
                      <div className="flex gap-3">
                        <div className="size-10 shrink-0 rounded-full bg-gradient-to-br from-black/12 to-black/[0.04]" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[13px] font-semibold text-[var(--woody-ink)]">Mariana Costa</p>
                            <span className="rounded-full bg-[var(--woody-tag-bg)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--woody-tag-text)]">
                              Cuidados e rotina
                            </span>
                          </div>
                          <p className="mt-2 text-[12px] font-medium leading-relaxed text-[var(--woody-muted)]">
                            Hoje partilho um ritual simples que me devolveu presença — sem pressa, só consistência.
                          </p>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {["Comunidade", "Afinidade"].map((t) => (
                              <span
                                key={t}
                                className="rounded-full bg-[var(--woody-tag-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--woody-tag-text)]"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-[1rem] border border-black/[0.06] bg-white/95 p-4">
                      <div className="h-2 w-28 rounded-full bg-black/10" />
                      <div className="mt-2 h-2 w-full rounded-full bg-black/[0.05]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
              Feed · comunidade · tags
            </p>
          </div>

          <div className="flex flex-col gap-8 lg:col-span-5">
            {/* Comunidade */}
            <div
              className="relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#eae8e2] shadow-[0_28px_80px_rgba(0,0,0,0.35)]"
              style={{ transform: "rotate(-1.5deg)" }}
            >
              <div className="h-24 bg-[linear-gradient(135deg,rgba(139,195,74,0.35),rgba(10,10,10,0.55))]" />
              <div className="space-y-3 px-5 pb-5 pt-4">
                <p className="font-serif text-lg font-semibold tracking-tight text-[var(--woody-ink)]">
                  Mulheres em movimento
                </p>
                <p className="text-[12px] font-medium leading-relaxed text-[var(--woody-muted)]">
                  Espaço privado · pedidos de entrada · conversas com contexto.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-black/[0.08] bg-white px-2.5 py-1 text-[10px] font-semibold text-[var(--woody-ink)]">
                    1,2k membros
                  </span>
                  <span className="rounded-full bg-[var(--woody-ink)] px-2.5 py-1 text-[10px] font-semibold text-[var(--woody-lime)]">
                    Pro cria
                  </span>
                </div>
              </div>
            </div>

            {/* Mensagens + perfil */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Direct</p>
                <div className="mt-4 space-y-2.5">
                  <div className="ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-[var(--woody-lime)] px-3.5 py-2.5 shadow-[0_12px_32px_rgba(139,195,74,0.18)]">
                    <p className="text-[12px] font-medium leading-snug text-[var(--woody-ink)]">
                      Amanhã combinamos o passo a passo — sem pressa.
                    </p>
                  </div>
                  <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.07] px-3.5 py-2.5">
                    <p className="text-[12px] font-medium leading-snug text-white/85">
                      Perfeito. Eu trago os links que te falei.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Perfil</p>
                <div className="mt-4 flex items-start gap-3">
                  <div className="size-12 shrink-0 rounded-full bg-gradient-to-br from-[var(--woody-lime)]/45 to-white/10 ring-2 ring-[var(--woody-lime)]/35" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="text-sm font-semibold text-white">Joana Ribeiro</p>
                    <div className="h-2 w-24 rounded-full bg-white/15" />
                    <div className="h-2 w-full rounded-full bg-white/10" />
                    <div className="mt-3 h-8 w-full rounded-lg bg-white/[0.06]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Onboarding strip */}
            <div className="rounded-[1.15rem] border border-[var(--woody-lime)]/25 bg-[#0f0f0f] p-5 shadow-[0_0_0_1px_rgba(139,195,74,0.12)]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Onboarding</p>
                <span className="rounded-full bg-[var(--woody-lime)]/15 px-2.5 py-0.5 text-[10px] font-bold text-[var(--woody-lime)]">
                  Passo 4 de 6
                </span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                <div className="h-full w-[55%] rounded-full bg-[var(--woody-lime)] shadow-[0_0_24px_rgba(139,195,74,0.35)]" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-2 w-44 rounded-full bg-white/15" />
                <div className="h-10 rounded-xl border border-white/10 bg-white/[0.04]" />
                <div className="h-10 rounded-xl border border-white/10 bg-white/[0.04]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
