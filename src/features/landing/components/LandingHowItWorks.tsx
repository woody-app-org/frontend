import { cn } from "@/lib/utils";
import { LANDING_IDS } from "../constants";

const steps = [
  { step: "01", title: "Cria o teu perfil", text: "Nome, voz e presença — o ponto de partida para te reconhecerem com cuidado." },
  { step: "02", title: "Escolhe interesses", text: "No onboarding, indicas temas para a Woody sugerir comunidades e conteúdo." },
  { step: "03", title: "Descobres pessoas e comunidades", text: "Feed, busca e recomendações pensadas para afinidade, não volume vazio." },
  { step: "04", title: "Publicas e participas", text: "No perfil ou dentro das comunidades — sempre com contexto visível." },
  { step: "05", title: "Aprofundas conexões", text: "Mensagens directas e conversas que nascem de algo partilhado." },
] as const;

export function LandingHowItWorks() {
  return (
    <section id={LANDING_IDS.comoFunciona} className="border-b border-black/[0.06] py-20 md:py-28">
      <div className="mx-auto max-w-[var(--layout-max-width)] px-[var(--layout-gutter)]">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--woody-muted)]">Como funciona</p>
          <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-[var(--woody-ink)] md:text-4xl">
            Cinco passos. Uma linha clara.
          </h2>
        </div>

        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          {steps.map((s, i) => (
            <li
              key={s.step}
              className={cn(
                "relative lg:pl-8",
                i > 0 && "lg:border-l lg:border-black/[0.08] lg:pl-8"
              )}
            >
              <span className="font-serif text-2xl font-semibold text-[var(--woody-lime)]">{s.step}</span>
              <h3 className="mt-3 font-semibold text-[var(--woody-text)]">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--woody-muted)]">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
