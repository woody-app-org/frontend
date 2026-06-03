import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PwaInstallSheet } from "./PwaInstallSheet";
import { isMobileViewport, isPwaInstalled } from "@/lib/pwa/platform";

/**
 * Página pública `/install` — destino do QR Code.
 * No mobile abre o fluxo de instalação; no desktop orienta a escanear o QR.
 */
export function InstallPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const installed = isPwaInstalled();
  const mobile = isMobileViewport();

  useEffect(() => {
    if (!installed) setSheetOpen(true);
  }, [installed]);

  return (
    <div className="flex min-h-svh flex-col bg-white text-[var(--woody-text)]">
      <header className="border-b border-[var(--woody-divider)] px-[var(--layout-gutter)] py-4">
        <Link
          to="/landing"
          className="font-display text-lg font-bold italic tracking-tight text-[var(--woody-ink)]"
        >
          Woody
        </Link>
      </header>

      <main className="mx-auto flex max-w-md flex-1 flex-col justify-center px-[var(--layout-gutter)] py-12 text-center">
        {installed ? (
          <>
            <h1 className="font-display text-2xl font-bold italic text-[var(--woody-ink)]">
              Woody já está instalada
            </h1>
            <p className="mt-3 text-sm text-[var(--woody-muted)]">
              Abra pelo ícone na tela inicial ou continue no navegador.
            </p>
            <Link
              to="/feed"
              className="mt-8 inline-flex h-10 items-center justify-center rounded-md bg-[var(--woody-nav)] px-6 text-sm font-medium text-white hover:bg-[var(--woody-nav)]/90"
            >
              Abrir Woody
            </Link>
          </>
        ) : mobile ? (
          <>
            <h1 className="font-display text-2xl font-bold italic text-[var(--woody-ink)]">
              Instalar Woody
            </h1>
            <p className="mt-3 text-sm text-[var(--woody-muted)]">
              Adicione a Woody à tela inicial para acessar como um app.
            </p>
            <button
              type="button"
              className="mt-8 text-sm font-semibold text-[var(--woody-nav)] underline-offset-2 hover:underline"
              onClick={() => setSheetOpen(true)}
            >
              Ver instruções de instalação
            </button>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold italic text-[var(--woody-ink)]">
              Woody no celular
            </h1>
            <p className="mt-3 text-balance text-sm text-[var(--woody-muted)]">
              Escaneie o QR Code na landing com o celular para instalar a Woody na tela inicial.
            </p>
            <Link
              to="/landing#woody-no-celular"
              className="mt-8 inline-flex h-10 items-center justify-center rounded-md border border-[var(--woody-divider)] px-6 text-sm font-medium hover:bg-[var(--woody-nav)]/5"
            >
              Ver QR na landing
            </Link>
            <button
              type="button"
              className="mt-4 text-sm text-[var(--woody-muted)] underline-offset-2 hover:underline"
              onClick={() => setSheetOpen(true)}
            >
              Instalar neste computador
            </button>
          </>
        )}
      </main>

      <PwaInstallSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
