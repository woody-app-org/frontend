import {
  Bell,
  Bookmark,
  Compass,
  Hash,
  Heart,
  ImageIcon,
  MessageCircle,
  Search,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { LANDING_IDS } from "../constants";

const items = [
  {
    icon: Users,
    title: "Perfil e voz próprias",
    body: "Publica no teu perfil ou dentro das comunidades onde te sentes representada — o mesmo conteúdo, contextos diferentes.",
  },
  {
    icon: Compass,
    title: "Descobrir comunidades",
    body: "Explora espaços com identidade: temas, ritmos e regras claras para cada grupo.",
  },
  {
    icon: Heart,
    title: "Seguir com intenção",
    body: "Acompanha pessoas e ideias que conversam com o teu momento.",
  },
  {
    icon: MessageCircle,
    title: "Mensagens em tempo real",
    body: "Direct fluido para aprofundar o que nasceu no feed ou nas comunidades.",
  },
  {
    icon: Hash,
    title: "Discussões com contexto",
    body: "Comentários e threads ligados a publicações e comunidades — menos dispersão, mais sentido.",
  },
  {
    icon: Shield,
    title: "Público e privado",
    body: "Comunidades abertas ou com mais controlo — escolhes onde e como participar.",
  },
  {
    icon: ImageIcon,
    title: "Perfil personalizado",
    body: "Presença cuidada, com espaço para quem és e para o que queres partilhar.",
  },
  {
    icon: Bookmark,
    title: "Destaque no perfil",
    body: "Realça o que importa — publicações em evidência quando fizer sentido.",
  },
  {
    icon: Sparkles,
    title: "Onboarding com interesses",
    body: "Um primeiro passo guiado para sugerir comunidades e conteúdo com mais afinidade.",
  },
  {
    icon: Search,
    title: "Busca",
    body: "Encontra pessoas e comunidades por nome, tema ou contexto.",
  },
  {
    icon: Bell,
    title: "Interações da plataforma",
    body: "Curtidas, respostas e notificações pensadas para acompanhar o que importa.",
  },
] as const;

const highlights = items.slice(0, 3);
const rest = items.slice(3);

export function LandingFeatures() {
  return (
    <section id={LANDING_IDS.recursos} className="border-b border-black/[0.06] bg-[#f6f5f2] py-24 md:py-32">
      <div className="mx-auto max-w-[var(--layout-max-width)] px-[var(--layout-gutter)]">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--woody-muted)]">
              <span className="h-px w-8 bg-[var(--woody-lime)]" aria-hidden />
              Recursos
            </p>
            <h2 className="mt-5 font-serif text-[clamp(2rem,4vw,3.15rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-[var(--woody-ink)]">
              O produto, em camadas claras.
            </h2>
            <p className="mt-6 text-[1.05rem] font-medium leading-relaxed text-[var(--woody-muted)] md:text-lg">
              Cada detalhe abaixo existe na Woody — apresentado com calma editorial, sem lista infinita genérica.
            </p>
          </div>
          <p className="max-w-sm text-sm font-medium leading-relaxed text-[var(--woody-muted)] lg:text-right lg:text-[15px]">
            Tipografia forte, cartões com hierarquia e acentos lime pontuais — a mesma linguagem visual que encontras
            na app.
          </p>
        </div>

        {/* Destaques — cartões horizontais premium */}
        <ul className="mt-14 space-y-5 md:mt-16">
          {highlights.map(({ icon: Icon, title, body }, idx) => (
            <li
              key={title}
              className="group relative overflow-hidden rounded-[1.35rem] border border-black/[0.07] bg-white p-7 shadow-[0_18px_60px_rgba(10,10,10,0.05)] ring-1 ring-black/[0.03] transition-[border-color,box-shadow,transform] duration-500 hover:-translate-y-0.5 hover:border-[var(--woody-lime)]/25 hover:shadow-[0_24px_80px_rgba(10,10,10,0.07)] md:flex md:items-start md:gap-10 md:p-9"
            >
              <div
                className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-[linear-gradient(180deg,rgba(139,195,74,0.15),rgba(139,195,74,0.95),rgba(139,195,74,0.15))] opacity-90 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
              <div className="flex shrink-0 items-center gap-4 md:block md:w-44">
                <span className="font-serif text-4xl font-semibold leading-none text-black/[0.08] transition-colors group-hover:text-[var(--woody-lime)]/35 md:text-5xl">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="flex size-14 items-center justify-center rounded-2xl bg-[var(--woody-ink)] text-[var(--woody-lime)] shadow-[0_0_0_1px_rgba(139,195,74,0.22),0_14px_40px_rgba(10,10,10,0.18)] md:size-[3.75rem] md:rounded-[1.1rem]">
                  <Icon className="size-6 md:size-7" strokeWidth={1.65} aria-hidden />
                </div>
              </div>
              <div className="mt-6 min-w-0 md:mt-0 md:flex-1">
                <h3 className="font-serif text-xl font-semibold tracking-tight text-[var(--woody-ink)] md:text-2xl">
                  {title}
                </h3>
                <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[var(--woody-muted)] md:text-base">
                  {body}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {/* Grelha refinada */}
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rest.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="flex flex-col rounded-[1.15rem] border border-black/[0.06] bg-white/90 p-6 shadow-[0_10px_40px_rgba(10,10,10,0.04)] ring-1 ring-black/[0.025] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-[var(--woody-lime)]/20 hover:shadow-[0_18px_50px_rgba(10,10,10,0.06)]"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--woody-main-surface)] text-[var(--woody-ink)] ring-1 ring-black/[0.06]">
                <Icon className="size-5" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="mt-5 min-w-0">
                <h3 className="text-[15px] font-semibold tracking-tight text-[var(--woody-ink)]">{title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-[var(--woody-muted)]">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
