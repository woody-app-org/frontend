import { useEffect } from "react";
import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { cn } from "@/lib/utils";
import woodyCat from "@/assets/new-cat.png";

const RELOAD_GUARD_KEY = "woody:chunk-reload-attempted";

/** Erro típico de deploy: o browser tem em cache um `index.html` antigo que aponta
 * para ficheiros JS com hash que já não existem no servidor — este devolve `index.html`
 * (text/html) em vez do chunk, e o browser recusa-se a executá-lo como script. */
function isStaleChunkError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";

  return (
    /Failed to fetch dynamically imported module/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message) ||
    /is not a valid JavaScript MIME type/i.test(message)
  );
}

/** Error element global do router: trata falhas de carregamento de chunks (recarrega
 * automaticamente uma vez) e mostra um ecrã amigável para os restantes erros. */
export function RouteErrorBoundary() {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;
  const isStaleChunk = !isNotFound && isStaleChunkError(error);

  let alreadyTriedReload = false;
  try {
    alreadyTriedReload = sessionStorage.getItem(RELOAD_GUARD_KEY) === "1";
  } catch {
    // sessionStorage indisponível (ex.: modo privado)
  }

  const isReloading = isStaleChunk && !alreadyTriedReload;

  useEffect(() => {
    if (!isReloading) return;

    try {
      sessionStorage.setItem(RELOAD_GUARD_KEY, "1");
    } catch {
      // ignora — pior caso é tentar recarregar mais que uma vez.
    }

    window.location.reload();
  }, [isReloading]);

  useEffect(() => {
    if (!isStaleChunk) {
      try {
        sessionStorage.removeItem(RELOAD_GUARD_KEY);
      } catch {
        // ignora
      }
    }
  }, [isStaleChunk]);

  if (isReloading) {
    return (
      <div className="min-h-screen bg-[var(--woody-sand)] flex items-center justify-center px-4">
        <p className="text-sm text-[var(--woody-ink)]/50">A atualizar a aplicação…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--woody-sand)] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[400px] flex flex-col items-center gap-6">
        <img
          src={woodyCat}
          alt="Woody"
          className="h-24 w-auto select-none sm:h-28"
          width={1598}
          height={1443}
          decoding="async"
          draggable={false}
        />

        <div className="bg-white rounded-3xl shadow-[0_2px_24px_rgba(0,0,0,0.07)] border border-black/[0.04] p-8 text-center space-y-4 w-full">
          <h1 className="text-xl font-bold text-[var(--woody-ink)] leading-tight">
            {isNotFound ? "Página não encontrada" : "Algo deu errado"}
          </h1>

          <p className="text-sm text-[var(--woody-ink)]/60 leading-relaxed">
            {isNotFound
              ? "Essa página não existe."
              : "Ocorreu um erro inesperado. Recarregue a página para tentar novamente."}
          </p>

          <button
            onClick={() =>
              isNotFound
                ? window.location.assign("/")
                : window.location.reload()
            }
            className={cn(
              "mt-2 w-full h-11 rounded-2xl text-sm font-semibold transition-all duration-150",
              "bg-[var(--woody-lime)] hover:brightness-95 active:scale-[0.985]",
              "text-[var(--woody-ink)] border-0 shadow-none"
            )}
          >
            {isNotFound ? "Ir para o início" : "Recarregar página"}
          </button>
        </div>
      </div>
    </div>
  );
}
