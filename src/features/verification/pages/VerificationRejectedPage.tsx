import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, RotateCcw, Loader2 } from "lucide-react";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  getVerificationStatus,
  deleteVerificationDocument,
} from "../services/verification.service";
import { showErrorToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export function VerificationRejectedPage() {
  const navigate = useNavigate();
  const { logout, patchUser } = useAuth();

  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const dto = await getVerificationStatus();
        if (!cancelled) setRejectionReason(dto.rejectionReason ?? null);
      } catch {
        /* silencioso */
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleResend = async () => {
    setIsResending(true);
    try {
      // Se houver documento anterior, limpa antes de redirecionar
      await deleteVerificationDocument().catch(() => null);
      patchUser({ verificationStatus: "PendingDocument" });
      navigate("/verification/document", { replace: true });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Não foi possível iniciar o reenvio. Tente novamente.";
      showErrorToast(msg, { id: "verification-resend-error" });
      setIsResending(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto mt-4 md:mt-0">
        <div className="rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden">
          {/* Cabeçalho */}
          <div className="bg-red-50 border-b border-red-100 px-6 py-5 flex items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-500">
              <AlertCircle className="size-5" aria-hidden />
            </div>
            <div>
              <h1 className="text-base font-semibold text-[var(--woody-ink)] leading-snug">
                Não conseguimos aprovar seu documento
              </h1>
              <p className="mt-0.5 text-sm text-[var(--woody-muted)]">
                Você pode enviar um novo documento para tentar novamente.
              </p>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Motivo da recusa */}
            <div className="rounded-xl border border-red-200/60 bg-red-50/50 px-4 py-3.5 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-500/80">
                Motivo da recusa
              </p>
              {isLoading ? (
                <div className="h-4 w-40 rounded-md bg-red-100 animate-pulse" />
              ) : (
                <p className="text-sm text-red-700 leading-relaxed">
                  {rejectionReason ?? "Documento não atendeu aos critérios de verificação."}
                </p>
              )}
            </div>

            {/* Orientações */}
            <div className="rounded-xl bg-[var(--woody-sand)] px-4 py-3.5 text-sm text-[var(--woody-ink)]/80 leading-relaxed space-y-1.5">
              <p className="font-medium text-[var(--woody-ink)]">Para o reenvio, certifique-se de:</p>
              <ul className="space-y-1 text-[var(--woody-muted)] pl-1">
                <li>• Foto nítida e sem reflexos da frente do RG</li>
                <li>• Nome e foto visíveis no documento</li>
                <li>• Arquivo JPG ou PNG com menos de 8 MB</li>
              </ul>
            </div>

            {/* Botão reenviar */}
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className={cn(
                "w-full h-11 rounded-xl font-semibold text-sm",
                "inline-flex items-center justify-center gap-2",
                "bg-[var(--auth-button)] text-white",
                "hover:bg-[var(--auth-button-hover)]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-colors duration-150 focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-[var(--auth-button)]/50"
              )}
            >
              {isResending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Preparando…
                </>
              ) : (
                <>
                  <RotateCcw className="size-4" aria-hidden />
                  Enviar novo documento
                </>
              )}
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={logout}
            className="text-sm text-[var(--woody-muted)] hover:text-[var(--woody-ink)] underline-offset-2 hover:underline transition-colors duration-150"
          >
            Sair da conta
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
