import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { LANDING_IDS } from "../constants";

export function LandingFinalCta() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[var(--layout-max-width)] px-[var(--layout-gutter)]">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#070707] px-6 py-16 text-center shadow-[0_40px_120px_rgba(10,10,10,0.35)] md:px-14 md:py-20 lg:px-20 lg:py-24">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-overlay [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:20px_20px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-[20%] top-1/2 h-[min(90vw,520px)] w-[min(90vw,520px)] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(139,195,74,0.22),transparent_62%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-[15%] -top-[30%] h-[min(70vw,420px)] w-[min(70vw,420px)] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.06),transparent_58%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(139,195,74,0.55),transparent)]"
            aria-hidden
          />

          <div className="relative mx-auto max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">Woody</p>
            <h2 className="mt-5 font-serif text-[clamp(2.1rem,4.8vw,3.35rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-white">
              Entra num espaço feito para{" "}
              <span className="relative inline-block text-[var(--woody-lime)]">
                conversar com calma
                <span
                  className="absolute -bottom-1 left-0 right-0 h-px bg-[var(--woody-lime)]/55"
                  aria-hidden
                />
              </span>
              .
            </h2>
            <p className="mx-auto mt-7 max-w-xl text-[1.05rem] font-medium leading-relaxed text-white/72 md:text-lg">
              Comunidades, perfil e mensagens no mesmo lugar — com estética e cuidado que convidam a ficar, sem ruído de
              timeline infinita.
            </p>

            <div className="mt-11 flex flex-wrap items-center justify-center gap-3 md:mt-12">
              <Button
                size="lg"
                className="h-[3.25rem] rounded-full bg-[var(--woody-lime)] px-9 text-[15px] font-semibold tracking-tight text-[var(--woody-ink)] shadow-[0_0_0_1px_rgba(139,195,74,0.35),0_0_48px_-6px_rgba(139,195,74,0.45),0_18px_48px_rgba(10,10,10,0.35)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:bg-[#9ccc60]"
                asChild
              >
                <Link to="/auth/onboarding/1" className="inline-flex items-center gap-2">
                  Criar conta
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-[3.25rem] rounded-full border-white/22 bg-transparent px-8 text-[15px] font-semibold tracking-tight text-white shadow-[inset_0_0_0_1px_rgba(139,195,74,0.12)] transition-colors hover:border-[var(--woody-lime)]/45 hover:bg-white/[0.06]"
                asChild
              >
                <a href={`#${LANDING_IDS.planos}`}>Ver planos</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
