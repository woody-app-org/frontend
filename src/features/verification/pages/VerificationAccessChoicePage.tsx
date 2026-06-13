import { useNavigate } from "react-router-dom";
import { KeyRound, FileImage, ChevronRight } from "lucide-react";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { useAuth } from "@/features/auth/context/AuthContext";
import { cn } from "@/lib/utils";

/**
 * Tela exibida antes da verificação por documento: a usuária informa se já possui
 * um código de acesso (liberado manualmente) ou se precisa seguir o fluxo normal
 * de envio de selfie/documento.
 */
export function VerificationAccessChoicePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

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
                Você tem um código de acesso?
              </h1>
              <p className="mt-0.5 text-sm text-[var(--woody-muted)]">
                Antes de seguir para a verificação, confira se você recebeu um código de acesso.
              </p>
            </div>
          </div>

          <div className="px-6 py-5 space-y-3">
            <button
              type="button"
              onClick={() => navigate("/verification/access-code")}
              className={cn(
                "w-full rounded-xl border border-black/10 bg-white",
                "px-4 py-4 flex items-center gap-3 text-left",
                "hover:border-[var(--auth-button)]/50 hover:bg-[var(--auth-button)]/5",
                "transition-colors duration-150 focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-[var(--auth-button)]/40"
              )}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--auth-button)]/12 text-[var(--auth-button-hover)]">
                <KeyRound className="size-5" aria-hidden />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--woody-ink)]">Tenho código de acesso</p>
                <p className="text-xs text-[var(--woody-muted)]">
                  Sua conta pode ser aprovada automaticamente.
                </p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-[var(--woody-muted)]" aria-hidden />
            </button>

            <button
              type="button"
              onClick={() => navigate("/verification/document")}
              className={cn(
                "w-full rounded-xl border border-black/10 bg-white",
                "px-4 py-4 flex items-center gap-3 text-left",
                "hover:border-[var(--auth-button)]/50 hover:bg-[var(--auth-button)]/5",
                "transition-colors duration-150 focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-[var(--auth-button)]/40"
              )}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--auth-button)]/12 text-[var(--auth-button-hover)]">
                <FileImage className="size-5" aria-hidden />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--woody-ink)]">Não tenho código de acesso</p>
                <p className="text-xs text-[var(--woody-muted)]">
                  Seguir para a verificação por selfie/documento.
                </p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-[var(--woody-muted)]" aria-hidden />
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
