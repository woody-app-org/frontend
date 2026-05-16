import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { LANDING_IDS } from "../constants";

const free = [
  "Criar perfil",
  "Publicar no perfil e em comunidades",
  "Seguir outras utilizadoras",
  "Participar de comunidades",
  "Mensagens e interações da plataforma",
  "Descobrir pessoas e conteúdos com afinidade",
] as const;

const pro = [
  "Tudo do plano Free",
  "Criar comunidades",
  "Administrar comunidades",
  "Badge Pro visível no perfil",
  "Presença premium ligada à tua atividade na Woody",
] as const;

export function LandingPricing() {
  return (
    <section
      id={LANDING_IDS.planos}
      className="relative overflow-hidden border-b border-black/[0.06] py-24 md:py-32"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#f3f1eb_0%,#ebe8e0_48%,#f5f3ee_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[min(120vw,900px)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_50%_0%,rgba(139,195,74,0.2),transparent_62%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[var(--layout-max-width)] px-[var(--layout-gutter)]">
        <header className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--woody-muted)]">
            <span className="h-px w-8 bg-[var(--woody-lime)]" aria-hidden />
            Planos
            <span className="h-px w-8 bg-[var(--woody-lime)]" aria-hidden />
          </p>
          <h2 className="mt-6 font-serif text-[clamp(2rem,4.2vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-[var(--woody-ink)]">
            Free para integrar.
            <br />
            <span className="text-[var(--woody-ink)]/78">Pro para liderar espaços.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[1.05rem] font-medium leading-relaxed text-[var(--woody-muted)] md:text-lg">
            Hierarquia clara, linguagem honesta — escolhe o ritmo e evolui quando fizer sentido criar e administrar
            comunidades.
          </p>
        </header>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:mt-20 lg:grid-cols-2 lg:items-stretch lg:gap-10">
          {/* Free */}
          <article className="group relative flex flex-col overflow-hidden rounded-[1.5rem] border border-black/[0.07] bg-white/85 p-9 shadow-[0_2px_0_rgba(139,195,74,0.35),0_24px_70px_rgba(10,10,10,0.06)] ring-1 ring-black/[0.04] backdrop-blur-sm md:p-10">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,rgba(139,195,74,0.15),rgba(139,195,74,0.95),rgba(139,195,74,0.15))]"
              aria-hidden
            />
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--woody-muted)]">Free</p>
                <p className="mt-3 font-serif text-5xl font-semibold tracking-tight text-[var(--woody-ink)] md:text-[3.25rem]">
                  0€
                </p>
              </div>
              <p className="max-w-[11rem] text-right text-sm font-medium leading-snug text-[var(--woody-muted)]">
                Explora, publica e encontra o teu lugar nas comunidades.
              </p>
            </div>

            <ul className="mt-10 flex flex-1 flex-col gap-3.5">
              {free.map((line) => (
                <li key={line} className="flex items-start gap-3.5 text-[15px] leading-snug text-[var(--woody-text)]">
                  <span className="mt-0.5 flex size-[1.35rem] shrink-0 items-center justify-center rounded-full border border-[var(--woody-lime)]/35 bg-[var(--woody-lime)]/12 text-[var(--woody-lime)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
                    <Check className="size-3.5" strokeWidth={2.75} aria-hidden />
                  </span>
                  <span className="pt-0.5">{line}</span>
                </li>
              ))}
            </ul>

            <Button
              variant="outline"
              className="mt-11 h-12 rounded-full border-[var(--woody-ink)]/12 bg-white/80 text-[15px] font-semibold tracking-tight text-[var(--woody-ink)] shadow-sm transition-colors hover:border-[var(--woody-lime)]/5 hover:bg-[var(--woody-lime)]/10"
              asChild
            >
              <Link to="/auth/onboarding/1">Começar grátis</Link>
            </Button>
          </article>

          {/* Pro */}
          <article className="relative flex flex-col overflow-hidden rounded-[1.5rem] border border-[var(--woody-lime)]/45 bg-[var(--woody-ink)] p-9 text-white shadow-[0_0_0_1px_rgba(139,195,74,0.12),0_32px_100px_rgba(10,10,10,0.45)] md:p-10">
            <div
              className="pointer-events-none absolute -right-24 -top-28 size-[22rem] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(139,195,74,0.22),transparent_62%)] blur-[2px]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-20 -left-16 size-72 rounded-full bg-white/[0.04]"
              aria-hidden
            />

            <div className="relative flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">Pro</p>
                  <span className="rounded-full border border-[var(--woody-lime)]/55 bg-[var(--woody-lime)]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--woody-lime)] shadow-[0_0_24px_-4px_rgba(139,195,74,0.55)]">
                    Recomendado
                  </span>
                </div>
                <p className="mt-4 max-w-[16rem] font-serif text-[1.65rem] font-semibold leading-[1.15] tracking-[-0.02em] md:text-[1.85rem]">
                  Para quem cria ecossistema na Woody.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-right backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Badge</p>
                <p className="mt-1 text-sm font-semibold text-[var(--woody-lime)]">Pro visível</p>
              </div>
            </div>

            <p className="relative mt-4 max-w-xl text-sm font-medium leading-relaxed text-white/68">
              Comunidades próprias, moderação e presença destacada — o plano para quem quer dar forma a conversas com
              identidade.
            </p>

            <ul className="relative mt-10 flex flex-1 flex-col gap-3.5">
              {pro.map((line) => (
                <li key={line} className="flex items-start gap-3.5 text-[15px] leading-snug text-white/92">
                  <span className="mt-0.5 flex size-[1.35rem] shrink-0 items-center justify-center rounded-full bg-[var(--woody-lime)]/22 text-[var(--woody-lime)] ring-1 ring-[var(--woody-lime)]/35">
                    <Check className="size-3.5" strokeWidth={2.75} aria-hidden />
                  </span>
                  <span className="pt-0.5">{line}</span>
                </li>
              ))}
            </ul>

            <Button
              className="relative mt-11 h-12 rounded-full bg-[var(--woody-lime)] text-[15px] font-semibold tracking-tight text-[var(--woody-ink)] shadow-[0_0_0_1px_rgba(139,195,74,0.35),0_18px_48px_rgba(139,195,74,0.28)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:bg-[#9ccc60] hover:shadow-[0_0_0_1px_rgba(139,195,74,0.45),0_22px_56px_rgba(139,195,74,0.35)]"
              asChild
            >
              <Link to="/auth/onboarding/1">Subir para Pro</Link>
            </Button>
            <p className="relative mt-3 text-center text-[11px] font-medium text-white/42">
              Depois de entrares, geres a subscrição na área de planos da conta.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
