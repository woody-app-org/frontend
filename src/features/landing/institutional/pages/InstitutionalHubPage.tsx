import { Link } from "react-router-dom";
import { INSTITUTIONAL_PATHS } from "../routes";
import { InstitutionalPrimaryCta } from "../components/InstitutionalPrimaryCta";

const entries = [
  {
    kicker: "01",
    title: "Nossa missão principal",
    desc: "Propósito, cuidado e espaço para existir em rede.",
    to: INSTITUTIONAL_PATHS.missao,
  },
  {
    kicker: "02",
    title: "O que é a Woody?",
    desc: "Origem do nome, público e promessa da plataforma.",
    to: INSTITUTIONAL_PATHS.oQueE,
  },
  {
    kicker: "03",
    title: "O que não é legal fazer aqui",
    desc: "Valores, limites e o que não toleramos.",
    to: INSTITUTIONAL_PATHS.regras,
  },
  {
    kicker: "04",
    title: "Políticas",
    desc: "Confidencialidade, acesso e boas práticas.",
    to: INSTITUTIONAL_PATHS.politicas,
  },
  {
    kicker: "05",
    title: "Woody no celular",
    desc: "QR code para abrir no telemóvel.",
    to: INSTITUTIONAL_PATHS.mobileQr,
  },
] as const;

export function InstitutionalHubPage() {
  return (
    <main className="px-[var(--layout-gutter)] pb-24 pt-12 md:pt-20">
      <div className="mx-auto max-w-[var(--layout-max-width)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.38em] text-[var(--woody-muted)]">Woody</p>
        <h1 className="mt-4 max-w-[18ch] font-sans text-[clamp(2.4rem,8vw,4.25rem)] font-black uppercase leading-[0.92] tracking-[-0.02em] text-[var(--woody-ink)]">
          Informação
        </h1>
        <p className="mt-6 max-w-lg font-serif text-lg leading-relaxed text-[var(--woody-ink)]/88 md:text-xl">
          Da missão às políticas — páginas para te orientares com clareza, sem frieza de manual corporativo.
        </p>

        <ul className="mt-16 border-y border-[var(--woody-ink)]/[0.1]" role="list">
          {entries.map((item) => (
            <li key={item.to} className="border-b border-[var(--woody-ink)]/[0.08] last:border-b-0">
              <Link
                to={item.to}
                className="group flex flex-col gap-4 py-10 transition-colors duration-300 hover:bg-black/[0.02] md:flex-row md:items-start md:gap-10 md:py-12"
              >
                <span className="shrink-0 font-sans text-sm font-bold tabular-nums tracking-widest text-[#8a6f4a] md:w-14 md:pt-1">
                  {item.kicker}
                </span>
                <div className="min-w-0 flex-1 md:flex md:items-start md:justify-between md:gap-12">
                  <h2 className="font-sans text-[clamp(1.35rem,3vw,2.1rem)] font-extrabold uppercase leading-tight tracking-[0.02em] text-[var(--woody-ink)] group-hover:text-[#3d4a28] md:max-w-[min(100%,28rem)]">
                    {item.title}
                  </h2>
                  <p className="mt-2 max-w-sm font-serif text-[0.98rem] leading-relaxed text-[var(--woody-muted)] md:mt-0 md:text-right md:text-[1rem]">
                    {item.desc}
                  </p>
                </div>
                <span
                  className="hidden shrink-0 text-2xl font-light text-[#8dbf43] transition-transform duration-300 group-hover:translate-x-1 md:inline md:pt-1"
                  aria-hidden
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-16 flex flex-col gap-6 border-t border-[var(--woody-ink)]/[0.08] pt-12 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl font-serif text-base leading-relaxed text-[var(--woody-ink)]/88">
            Pronta para entrar? A Woody espera-te com comunidades, conversas e ferramentas pensadas para o teu ritmo.
          </p>
          <InstitutionalPrimaryCta to="/auth/onboarding/1" variant="lime">
            Criar conta
          </InstitutionalPrimaryCta>
        </div>
      </div>
    </main>
  );
}
