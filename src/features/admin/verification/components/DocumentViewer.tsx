import { useEffect, useState, useCallback } from "react";
import { ShieldAlert, Loader2, AlertCircle, RefreshCw, Eye, EyeOff } from "lucide-react";
import { fetchVerificationDocumentBlob } from "../services/adminVerification.service";
import { cn } from "@/lib/utils";

interface DocumentViewerProps {
  verificationId: number;
  hasDocument: boolean;
  className?: string;
}

type LoadState = "idle" | "loading" | "ready" | "error";

/**
 * Carrega o documento de identidade via Axios (Bearer token no header),
 * converte para Blob URL local — nunca expõe o JWT ou URL pública.
 */
export function DocumentViewer({
  verificationId,
  hasDocument,
  className,
}: DocumentViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [isRevealed, setIsRevealed] = useState(false);

  const load = useCallback(async () => {
    if (!hasDocument) return;
    setLoadState("loading");
    setBlobUrl(null);
    try {
      const blob = await fetchVerificationDocumentBlob(verificationId);
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }, [verificationId, hasDocument]);

  // Revoga a Blob URL ao desmontar para liberar memória
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  useEffect(() => {
    if (hasDocument) void load();
  }, [load, hasDocument]);

  if (!hasDocument) {
    return (
      <div className={cn("rounded-xl border border-dashed border-black/15 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-400", className)}>
        Nenhum documento enviado.
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Aviso de sensibilidade */}
      <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200/60 px-3 py-2 text-xs text-amber-700">
        <ShieldAlert className="size-3.5 shrink-0" aria-hidden />
        <span>
          <strong>Documento sensível</strong> — acesso restrito à equipa Woody. Não compartilhe ou
          imprima.
        </span>
      </div>

      {/* Área do documento */}
      <div className="relative rounded-xl border border-black/10 bg-zinc-50 overflow-hidden">
        {loadState === "loading" && (
          <div className="flex h-56 items-center justify-center gap-2 text-sm text-zinc-400">
            <Loader2 className="size-5 animate-spin" aria-hidden />
            Carregando documento…
          </div>
        )}

        {loadState === "error" && (
          <div className="flex h-56 flex-col items-center justify-center gap-3 text-sm text-zinc-500">
            <AlertCircle className="size-7 text-red-400" aria-hidden />
            <span>Não foi possível carregar o documento.</span>
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-1.5 rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <RefreshCw className="size-3.5" aria-hidden />
              Tentar novamente
            </button>
          </div>
        )}

        {loadState === "ready" && blobUrl && (
          <>
            {/* Overlay de revelação */}
            {!isRevealed && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-zinc-900/70 backdrop-blur-sm">
                <ShieldAlert className="size-8 text-white/80" aria-hidden />
                <p className="text-sm text-white/90 text-center px-4">
                  Clique para visualizar o documento
                </p>
                <button
                  type="button"
                  onClick={() => setIsRevealed(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-4 py-2 text-sm font-medium text-white hover:bg-white/25 transition-colors"
                >
                  <Eye className="size-4" aria-hidden />
                  Mostrar documento
                </button>
              </div>
            )}
            <img
              src={blobUrl}
              alt="Documento de identidade"
              className="w-full max-h-96 object-contain"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
            {isRevealed && (
              <div className="border-t border-black/8 bg-white/60 px-3 py-1.5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsRevealed(false)}
                  className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  <EyeOff className="size-3.5" aria-hidden />
                  Ocultar
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
