import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, RefreshCw, Loader2 } from "lucide-react";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getVerificationStatus } from "../services/verification.service";
import { showInfoToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export function VerificationPendingPage() {
  const navigate = useNavigate();
  const { logout, patchUser } = useAuth();

  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkStatus = useCallback(async () => {
    setIsChecking(true);
    try {
      const dto = await getVerificationStatus();
      if (dto.status === "Approved") {
        patchUser({ verificationStatus: "Approved" });
        navigate("/feed", { replace: true });
        return;
      }
      if (dto.status === "Rejected") {
        patchUser({ verificationStatus: "Rejected" });
        navigate("/verification/rejected", { replace: true });
        return;
      }
      if (dto.status === "PendingDocument") {
        patchUser({ verificationStatus: "PendingDocument" });
        navigate("/verification/document", { replace: true });
        return;
      }
      setLastChecked(new Date());
      showInfoToast("Sua conta ainda está em análise.", { id: "verification-status-check" });
    } catch {
      showInfoToast("Não foi possível verificar o status agora. Tente novamente.", {
        id: "verification-status-error",
      });
    } finally {
      setIsChecking(false);
    }
  }, [navigate, patchUser]);

  // Verificação automática discreta ao montar (sem polling agressivo)
  useEffect(() => {
    const timer = setTimeout(() => void checkStatus(), 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto mt-4 md:mt-0">
        <div className="rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden">
          {/* Cabeçalho */}
          <div className="bg-amber-50 border-b border-amber-100 px-6 py-5 flex items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Clock className="size-5" aria-hidden />
            </div>
            <div>
              <h1 className="text-base font-semibold text-[var(--woody-ink)] leading-snug">
                Sua conta está em revisão
              </h1>
              <p className="mt-0.5 text-sm text-[var(--woody-muted)]">
                Recebemos seu documento e estamos analisando.
              </p>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Mensagem principal */}
            <div className="rounded-xl bg-[var(--woody-sand)] px-4 py-4 space-y-2">
              <p className="text-sm text-[var(--woody-ink)]/85 leading-relaxed">
                Nossa equipe vai analisar seu acesso em breve. Você receberá uma confirmação
                quando sua conta for aprovada.
              </p>
              <p className="text-xs text-[var(--woody-muted)]">
                O processo geralmente leva algumas horas. Se demorar mais de 72 horas, entre em
                contato com o nosso suporte pelo e-mail{" "}
                <a href="mailto:contato@thewoody.co" className="font-semibold underline underline-offset-2">
                  contato@thewoody.co
                </a>
                .
              </p>
            </div>

            {/* Status visual */}
            <div className="flex items-center gap-3 rounded-xl border border-amber-200/70 bg-amber-50/60 px-4 py-3">
              <div className="size-2.5 shrink-0 rounded-full bg-amber-400 ring-4 ring-amber-100 motion-safe:animate-pulse" />
              <div>
                <p className="text-sm font-medium text-amber-800">Documento em análise</p>
                {lastChecked && (
                  <p className="text-xs text-amber-600">
                    Verificado às {lastChecked.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </div>
            </div>

            {/* Atualizar status */}
            <button
              type="button"
              onClick={checkStatus}
              disabled={isChecking}
              className={cn(
                "w-full h-11 rounded-xl font-semibold text-sm",
                "inline-flex items-center justify-center gap-2",
                "border border-black/15 bg-white text-[var(--woody-ink)]",
                "hover:bg-[var(--woody-sand)] disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-colors duration-150 focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-black/20"
              )}
            >
              {isChecking ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Verificando…
                </>
              ) : (
                <>
                  <RefreshCw className="size-4" aria-hidden />
                  Atualizar status
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
