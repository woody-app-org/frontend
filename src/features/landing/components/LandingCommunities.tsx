import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Globe, Lock, Sparkles } from "lucide-react";
import { LANDING_IDS } from "../constants";

export function LandingCommunities() {
  return (
    <section id={LANDING_IDS.comunidades} className="border-b border-black/[0.06] py-20 md:py-28">
      <div className="mx-auto max-w-[var(--layout-max-width)] px-[var(--layout-gutter)]">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--woody-muted)]">Comunidades</p>
            <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-[var(--woody-ink)] md:text-4xl">
              O coração da Woody bate em comunidade.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--woody-muted)]">
              Entra em espaços onde conversas importam. Partilha no perfil ou dentro do grupo. Com o plano Pro, podes
              criar e administrar comunidades — com badge que reflete a tua presença na plataforma.
            </p>
          </div>
          <div className="flex justify-start lg:justify-end">
            <Button variant="outline" className="rounded-full border-black/15 font-semibold" asChild>
              <Link to="/auth/onboarding/1">Começar na Woody</Link>
            </Button>
          </div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--woody-main-surface)] text-[var(--woody-ink)]">
              <Globe className="size-5" strokeWidth={1.75} aria-hidden />
            </div>
            <h3 className="mt-5 font-semibold text-[var(--woody-text)]">Públicas</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--woody-muted)]">
              Descobre temas e entra em conversas abertas — ideal para explorar e encontrar afinidade.
            </p>
          </article>
          <article className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--woody-main-surface)] text-[var(--woody-ink)]">
              <Lock className="size-5" strokeWidth={1.75} aria-hidden />
            </div>
            <h3 className="mt-5 font-semibold text-[var(--woody-text)]">Privadas</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--woody-muted)]">
              Espaços com mais controlo — para grupos que valorizam limites e contexto partilhado.
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--woody-lime)]/35 bg-[var(--woody-ink)] p-6 text-white shadow-[0_16px_48px_rgba(10,10,10,0.12)]">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--woody-lime)]/20 text-[var(--woody-lime)]">
              <Sparkles className="size-5" strokeWidth={1.75} aria-hidden />
            </div>
            <h3 className="mt-5 font-semibold text-white">Pro — criar e liderar</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              Cria comunidades, administra membros e reforça a tua presença com o badge Pro.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
