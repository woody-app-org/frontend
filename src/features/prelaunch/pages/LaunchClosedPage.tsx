import { WoodyCatLogo } from "../components/WoodyCatLogo";

export function LaunchClosedPage() {
  return (
    <div className="min-h-[100dvh] bg-[var(--woody-sand)] flex flex-col items-center justify-center px-4 py-10">
      <main className="flex flex-col items-center text-center gap-6 sm:gap-7 max-w-[35rem] w-full">
        <WoodyCatLogo />

        <div className="space-y-4 max-w-[32rem] w-full">
          <h1 className="text-[1.625rem] sm:text-[1.875rem] font-bold text-[var(--woody-ink)] leading-[1.25] tracking-tight">
            A Woody chega em junho.
          </h1>

          <p className="text-base sm:text-[1.0625rem] text-[var(--woody-ink)]/75 leading-[1.6]">
            Uma rede social privada e moderna, feita para a comunidade sáfica
            criar conexões, compartilhar conteúdo, construir pontes e conversar
            com mais liberdade, cuidado e segurança.
          </p>
        </div>
      </main>
    </div>
  );
}
