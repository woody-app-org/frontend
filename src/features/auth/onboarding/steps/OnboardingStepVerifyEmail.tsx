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
import { OnboardingStepHeader } from "../components/OnboardingStepHeader";
import { onboardingStyles } from "../uiTokens";
import { cn } from "@/lib/utils";

const RESEND_COOLDOWN_S = 45;
const ADVANCE_DELAY_MS = 520;

function pause(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

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
  const [isAdvancing, setIsAdvancing] = useState(false);
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
      setSendFeedback("Se não aparecer na caixa de entrada, confira o spam.");
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
      setIsVerifying(false);
      updateDraft({ emailVerified: true });
      setIsAdvancing(true);
      await pause(ADVANCE_DELAY_MS);
      goNext();
    } finally {
      setIsVerifying(false);
    }
  });

  const handleResend = async () => {
    if (cooldown > 0 || isSending || isVerifying || isAdvancing) return;
    await runSendCode();
  };

  return (
    <div className="relative">
      {isAdvancing ? (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-[var(--auth-panel-maroon)]/92 text-center px-4 py-10 backdrop-blur-[2px] animate-in fade-in duration-300"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader2 className="size-9 animate-spin text-[var(--auth-text-on-maroon)]" aria-hidden />
          <p className="text-sm font-medium text-[var(--auth-text-on-maroon)]">Preparando a próxima etapa…</p>
          <p className="text-xs text-[var(--auth-text-on-maroon)]/70 max-w-xs">Quase lá. Só um instante.</p>
        </div>
      ) : null}

      <OnboardingStepHeader
        icon={Mail}
        title="Confirme seu e-mail"
        lead={`Enviamos um código de 6 dígitos para ${draft.account.email}. Insira abaixo para seguir com segurança.`}
        trustNote="Ninguém vê este código além de você. Na versão final, ele expira após alguns minutos."
      />

      <div className={cn(onboardingStyles.demoCallout, "mb-6")}>
        Demonstração: código <span className="font-mono font-semibold">{MOCK_EMAIL_VERIFICATION_CODE}</span>
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
          <label className="block text-sm font-medium text-[var(--auth-text-on-maroon)]/90 mb-3" htmlFor="otp-0">
            Código de verificação
          </label>
          <Controller
            name="code"
            control={form.control}
            render={({ field, fieldState }) => (
              <OnboardingCodeInput
                value={field.value}
                onChange={(v) => field.onChange(v)}
                disabled={isVerifying || isAdvancing}
                hasError={!!fieldState.error || !!verifyError}
                isComplete={codeValid && !verifyError && !isVerifying}
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
            disabled={!codeValid || isVerifying || isAdvancing}
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
