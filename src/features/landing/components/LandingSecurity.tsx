import { Lock, MessageSquareQuote, UserRound } from "lucide-react";
import { LANDING_IDS } from "../constants";

export function LandingSecurity() {
  return (
    <section id={LANDING_IDS.seguranca} className="border-b border-black/[0.06] bg-[var(--woody-ink)] py-20 text-white md:py-28">
      <div className="mx-auto max-w-[var(--layout-max-width)] px-[var(--layout-gutter)]">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">Segurança e contexto</p>
            <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight tracking-tight md:text-[2.35rem]">
              Um ambiente mais acolhedor, com interações mais claras.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-white/72">
              A Woody privilegia espaços com identidade: comunidades com propósito, conversas com contexto e
              pedidos de mensagem quando faz sentido — para que pertencer não signifique exposição desmedida.
            </p>
          </div>

          <ul className="space-y-4">
            {[
              {
                icon: MessageSquareQuote,
                title: "Conversas com contexto",
                text: "Publicações, comentários e comunidades dão moldura ao que está a ser dito.",
              },
              {
                icon: Lock,
                title: "Controlo da tua presença",
                text: "Participação em comunidades públicas ou privadas, no teu ritmo e com regras visíveis.",
              },
              {
                icon: UserRound,
                title: "Identidade das comunidades",
                text: "Cada espaço pode ter voz própria — temas, moderação e cultura alinhados ao grupo.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <li
                key={title}
                className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--woody-lime)]/15 text-[var(--woody-lime)]">
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/70">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
