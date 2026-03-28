import { useState, useEffect, useCallback, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import { useOnboardingDraftContext } from "../OnboardingContext";
import { useOnboardingNavigation } from "../hooks/useOnboardingNavigation";
import { MOCK_EMAIL_VERIFICATION_CODE } from "../constants";
import { emailVerificationCodeSchema, type EmailVerificationCodeFormData } from "../validation";
import { mockSendVerificationCode, mockVerifyEmailCode } from "../services/emailVerificationMock";
import { OnboardingCodeInput } from "../components/OnboardingCodeInput";
import { onboardingStyles } from "../uiTokens";
import { cn } from "@/lib/utils";

const RESEND_COOLDOWN_S = 45;

/**
 * Etapa 2 — verificação de e-mail (handlers mockados substituíveis por API).
 */
export function OnboardingStepVerifyEmail() {
  const { draft, updateDraft } = useOnboardingDraftContext();
  const { goNext } = useOnboardingNavigation();
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendFeedback, setSendFeedback] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const initialSendDone = useRef(false);

  const form = useForm<EmailVerificationCodeFormData>({
    resolver: zodResolver(emailVerificationCodeSchema),
    mode: "onChange",
    defaultValues: { code: "" },
  });

  const code = form.watch("code");
  const codeValid = code.replace(/\D/g, "").length === 6 && !form.formState.errors.code;

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  const runSendCode = useCallback(async () => {
    const email = draft.account?.email;
    if (!email) return;
    setIsSending(true);
    setSendFeedback(null);
    try {
      await mockSendVerificationCode(email);
      setSendFeedback("Código reenviado. Confira sua caixa de entrada (mock).");
      setCooldown(RESEND_COOLDOWN_S);
    } finally {
      setIsSending(false);
    }
  }, [draft.account?.email]);

  useEffect(() => {
    if (!draft.account?.email || initialSendDone.current) return;
    initialSendDone.current = true;
    void runSendCode();
  }, [draft.account?.email, runSendCode]);

  if (!draft.account) {
    return <Navigate to="/auth/onboarding/1" replace />;
  }

  const onSubmit = form.handleSubmit(async (data) => {
    setVerifyError(null);
    setIsVerifying(true);
    try {
      const result = await mockVerifyEmailCode(data.code);
      if (!result.ok) {
        setVerifyError(result.error ?? "Não foi possível verificar.");
        return;
      }
      updateDraft({ emailVerified: true });
      goNext();
    } finally {
      setIsVerifying(false);
    }
  });

  const handleResend = async () => {
    if (cooldown > 0 || isSending || isVerifying) return;
    await runSendCode();
  };

  return (
    <div>
      <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-[var(--auth-panel-beige)]/12 text-[var(--auth-text-on-maroon)]">
        <Mail className="size-6 opacity-90" aria-hidden />
      </div>
      <h1 className={onboardingStyles.stepTitle}>Confirme seu e-mail</h1>
      <p className={onboardingStyles.stepLead}>
        Enviamos um código de 6 dígitos para{" "}
        <span className="font-semibold text-[var(--auth-text-on-maroon)]">{draft.account.email}</span>.
        Insira abaixo para seguir em segurança.
      </p>

      <div className="mb-6 rounded-xl border border-dashed border-white/20 bg-[var(--auth-panel-beige)]/[0.06] px-3 py-2.5 text-center text-xs text-[var(--auth-text-on-maroon)]/75">
        Ambiente de demonstração: use o código{" "}
        <span className="font-mono font-semibold">{MOCK_EMAIL_VERIFICATION_CODE}</span>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {verifyError && (
          <p
            className="text-sm text-red-200 bg-red-900/35 rounded-xl px-3 py-2.5 border border-red-400/20"
            role="alert"
          >
            {verifyError}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-[var(--auth-text-on-maroon)]/90 mb-3">
            Código de verificação
          </label>
          <Controller
            name="code"
            control={form.control}
            render={({ field, fieldState }) => (
              <OnboardingCodeInput
                value={field.value}
                onChange={(v) => field.onChange(v)}
                disabled={isVerifying}
                hasError={!!fieldState.error || !!verifyError}
              />
            )}
          />
          {form.formState.errors.code && (
            <p className="mt-2 text-sm text-red-200" role="alert">
              {form.formState.errors.code.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => void handleResend()}
            disabled={cooldown > 0 || isSending || isVerifying}
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
            <p className="text-xs text-[var(--auth-text-on-maroon)]/70 sm:text-right">{sendFeedback}</p>
          ) : null}
        </div>

        <div className={onboardingStyles.footerRow}>
          <span />
          <button
            type="submit"
            disabled={!codeValid || isVerifying}
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
