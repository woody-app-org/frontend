import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { useOnboardingDraftContext } from "../OnboardingContext";
import { useOnboardingNavigation } from "../hooks/useOnboardingNavigation";
import { emailVerificationCodeSchema, type EmailVerificationCodeFormData } from "../validation";
import { useConfirmEmailCode } from "../hooks/useConfirmEmailCode";
import { useResendEmailCode } from "../hooks/useResendEmailCode";
import { OnboardingCodeInput } from "../components/OnboardingCodeInput";
import { OnboardingStepHeader } from "../components/OnboardingStepHeader";
import { onboardingStyles } from "../uiTokens";
import { cn } from "@/lib/utils";

const ADVANCE_DELAY_MS = 520;

function pause(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function initialAutoSendStorageKey(emailAddr: string): string {
  return `woody_email_initial_code_sent:${emailAddr.toLowerCase().trim()}`;
}

/**
 * Etapa 2 — verificação de e-mail via API real.
 */
export function OnboardingStepVerifyEmail() {
  const { draft, updateDraft } = useOnboardingDraftContext();
  const { goNext } = useOnboardingNavigation();
  const email = draft.account?.email;
  const { isVerifying, verifyError, verifyCooldown, clearVerifyError, confirmCode } = useConfirmEmailCode(email);
  const { cooldown, isSending, sendFeedback, sendError, sendInitialCode, resendCode, clearSendError } =
    useResendEmailCode(email);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const form = useForm<EmailVerificationCodeFormData>({
    resolver: zodResolver(emailVerificationCodeSchema),
    mode: "onChange",
    defaultValues: { code: "" },
  });

  const code = useWatch({ control: form.control, name: "code", defaultValue: "" }) ?? "";
  const codeValid = code.replace(/\D/g, "").length === 6 && !form.formState.errors.code;

  useEffect(() => {
    if (!email) return;
    const key = initialAutoSendStorageKey(email);
    const raw = sessionStorage.getItem(key);
    // Já enviámos com sucesso nesta sessão (valor = timestamp).
    if (raw && !raw.startsWith("pending:")) {
      const ts = Number(raw);
      if (!Number.isNaN(ts)) return;
    }
    // Strict Mode: primeiro mount pôs "pending:ts"; o segundo mount não deve repetir enquanto o pedido estiver ativo.
    if (raw?.startsWith("pending:")) {
      const started = Number(raw.slice("pending:".length));
      if (!Number.isNaN(started) && Date.now() - started < 120_000) return;
      sessionStorage.removeItem(key);
    }

    sessionStorage.setItem(key, `pending:${Date.now()}`);
    void (async () => {
      try {
        const sent = await sendInitialCode();
        if (sent) {
          sessionStorage.setItem(key, String(Date.now()));
        } else {
          sessionStorage.removeItem(key);
        }
      } catch {
        sessionStorage.removeItem(key);
      }
    })();
  }, [email, sendInitialCode]);

  if (!draft.account) {
    return <Navigate to="/auth/onboarding/1" replace />;
  }

  const onSubmit = form.handleSubmit(async (data) => {
    clearSendError();
    const verified = await confirmCode(data.code);
    if (!verified) {
      return;
    }

    if (email) {
      sessionStorage.removeItem(initialAutoSendStorageKey(email));
    }
    updateDraft({ emailVerified: true });
    setIsConfirmed(true);
    setIsAdvancing(true);
    await pause(ADVANCE_DELAY_MS);
    goNext();
  });

  const handleResend = async () => {
    if (cooldown > 0 || isSending || isVerifying || isAdvancing) return;
    clearVerifyError();
    await resendCode();
  };

  return (
    <div className="relative">
      {isAdvancing ? (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-white/95 border border-black/10 text-center px-4 py-10 backdrop-blur-[2px] animate-in fade-in duration-300"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          {isConfirmed ? (
            <>
              <CheckCircle2 className="size-9 text-emerald-200" aria-hidden />
              <p className="text-sm font-medium text-[var(--auth-text-on-maroon)]">E-mail confirmado com sucesso!</p>
              <p className="text-xs text-[var(--auth-text-on-maroon)]/70 max-w-xs">
                Preparando a próxima etapa...
              </p>
            </>
          ) : (
            <>
              <Loader2 className="size-9 animate-spin text-[var(--auth-text-on-maroon)]" aria-hidden />
              <p className="text-sm font-medium text-[var(--auth-text-on-maroon)]">Preparando a próxima etapa…</p>
              <p className="text-xs text-[var(--auth-text-on-maroon)]/70 max-w-xs">Quase lá. Só um instante.</p>
            </>
          )}
        </div>
      ) : null}

      <OnboardingStepHeader
        icon={Mail}
        title="Confirme seu e-mail"
        lead={`Enviamos um código de 6 dígitos para ${draft.account.email}. Insira abaixo para seguir com segurança.`}
        trustNote="Ninguém vê este código além de você. O código expira em alguns minutos."
      />

      <form onSubmit={onSubmit} className="space-y-6">
        {verifyError && (
          <p
            className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2.5 border border-red-200"
            role="alert"
          >
            {verifyError}
          </p>
        )}
        {verifyCooldown > 0 && (
          <p className="text-sm text-amber-900 bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-200" role="status">
            Aguarde {verifyCooldown}s antes de tentar confirmar novamente.
          </p>
        )}
        {sendError && (
          <p
            className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2.5 border border-red-200"
            role="alert"
          >
            {sendError}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-[var(--auth-text-on-maroon)]/90 mb-3" htmlFor="otp-0">
            Código de verificação
          </label>
          <Controller
            name="code"
            control={form.control}
            render={({ field, fieldState }) => (
              <OnboardingCodeInput
                value={field.value}
                onChange={(v) => {
                  if (verifyError) clearVerifyError();
                  field.onChange(v);
                }}
                disabled={isVerifying || isAdvancing || verifyCooldown > 0}
                hasError={!!fieldState.error || !!verifyError}
                isComplete={codeValid && !verifyError && !isVerifying}
              />
            )}
          />
          {form.formState.errors.code && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {form.formState.errors.code.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => void handleResend()}
            disabled={cooldown > 0 || isSending || isVerifying || isAdvancing}
            className={onboardingStyles.ghostBtn}
          >
            {isSending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Reenviando...
              </span>
            ) : cooldown > 0 ? (
              `Reenviar código em ${cooldown}s`
            ) : (
              "Reenviar código"
            )}
          </button>
          {sendFeedback && !isSending ? (
            <p className="text-xs text-[var(--auth-text-on-maroon)]/70 sm:text-right max-w-[16rem] sm:max-w-none leading-snug">
              {sendFeedback}
            </p>
          ) : null}
        </div>

        <div className={onboardingStyles.footerRow}>
          <span />
          <button
            type="submit"
            disabled={!codeValid || isVerifying || isAdvancing || verifyCooldown > 0}
            className={cn(onboardingStyles.primaryBtn, "inline-flex items-center justify-center gap-2")}
          >
            {isVerifying ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Verificando...
              </>
            ) : (
              "Confirmar e continuar"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
