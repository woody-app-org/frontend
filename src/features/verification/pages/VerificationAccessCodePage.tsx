import { useCallback, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { useAuth } from "@/features/auth/context/AuthContext";
import { submitAccessCode } from "../services/verification.service";
import { getApiErrorMessage } from "@/lib/api";
import { showErrorToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export function VerificationAccessCodePage() {
  const navigate = useNavigate();
  const { logout, patchUser } = useAuth();

  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setCode(e.target.value);
  }, []);

  const handleSubmit = useCallback(async () => {
    const trimmed = code.trim();
    if (trimmed.length < 4) {
      setError("Informe um código de acesso válido.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const result = await submitAccessCode(trimmed);
      patchUser({ verificationStatus: result.status });
      setSuccess(true);
      setTimeout(() => navigate("/feed", { replace: true }), 1000);
    } catch (err) {
      const msg = getApiErrorMessage(err, "Não foi possível validar o código. Tente novamente.");
      setError(msg);
      showErrorToast(msg, { id: "verification-access-code-error" });
    } finally {
      setIsSubmitting(false);
    }
  }, [code, navigate, patchUser]);

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto mt-4 md:mt-0">
        <div className="rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden">
          {/* Cabeçalho */}
          <div className="bg-[var(--auth-button)]/8 border-b border-black/8 px-6 py-5 flex items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--auth-button)]/15 text-[var(--auth-button-hover)]">
              <KeyRound className="size-5" aria-hidden />
            </div>
            <div>
              <h1 className="text-base font-semibold text-[var(--woody-ink)] leading-snug">
                Código de acesso
              </h1>
              <p className="mt-0.5 text-sm text-[var(--woody-muted)]">
                Informe o código que você recebeu para liberar sua conta automaticamente.
              </p>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="access-code" className="text-sm font-medium text-[var(--woody-ink)]/80">
                Código de acesso
              </label>
              <input
                id="access-code"
                type="text"
                inputMode="text"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                value={code}
                onChange={handleChange}
                disabled={isSubmitting || success}
                placeholder="Digite seu código"
                className={cn(
                  "w-full h-11 rounded-xl border border-black/10 bg-white px-4 text-sm",
                  "text-[var(--woody-ink)] placeholder:text-[var(--woody-muted)]",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--auth-button)]/40 focus:border-[var(--auth-button)]/50",
                  "disabled:opacity-60"
                )}
              />
            </div>

            {/* Erro */}
            {error && (
              <p
                className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
                role="alert"
              >
                {error}
              </p>
            )}

            {/* Sucesso */}
            {success && (
              <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3.5 py-2.5 text-sm text-green-700">
                <CheckCircle2 className="size-4 shrink-0" aria-hidden />
                Código válido! Sua conta foi aprovada. Redirecionando…
              </div>
            )}

            {/* Botão */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!code.trim() || isSubmitting || success}
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
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Validando…
                </>
              ) : (
                "Validar código"
              )}
            </button>

            {/* Voltar */}
            <button
              type="button"
              onClick={() => navigate("/verification/access-choice")}
              disabled={isSubmitting || success}
              className={cn(
                "w-full inline-flex items-center justify-center gap-1.5 text-sm font-medium",
                "text-[var(--woody-muted)] hover:text-[var(--woody-ink)]",
                "transition-colors duration-150 disabled:opacity-50"
              )}
            >
              <ArrowLeft className="size-4" aria-hidden />
              Voltar
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
