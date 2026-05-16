export function LandingAbout() {
  return (
    <section className="border-b border-black/[0.06] py-20 md:py-28">
      <div className="mx-auto max-w-[var(--layout-max-width)] px-[var(--layout-gutter)]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--woody-muted)]">O que é a Woody</p>
          <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-[var(--woody-ink)] md:text-4xl">
            Uma rede social orientada por comunidades.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-[var(--woody-muted)] md:text-xl">
            Perfis, publicações, comunidades públicas e privadas, mensagens diretas e descoberta de pessoas e conteúdos
            com afinidade — tudo pensado para conversas com mais contexto e menos ruído.
          </p>
        </div>
      </div>
    </section>
  );
}
