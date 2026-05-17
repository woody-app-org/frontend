import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { cn } from "@/lib/utils";
import woodyCat from "@/assets/new-cat.png";

export function WaitlistErrorPage() {
  const error = useRouteError();

  const isNotFound =
    isRouteErrorResponse(error) && error.status === 404;

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
              ? "Essa página não existe. Volte para a inscrição pelo link correto."
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
            {isNotFound ? "Ir para a inscrição" : "Recarregar página"}
          </button>
        </div>

        <p className="text-xs text-[var(--woody-ink)]/30">
          Woody · Pré-lançamento
        </p>
      </div>
    </div>
  );
}
