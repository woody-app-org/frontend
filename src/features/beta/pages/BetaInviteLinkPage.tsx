import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { WoodyLogo } from "@/components/branding/WoodyLogo";
import { postValidateInvite } from "@/features/beta/betaInvite.api";
import { setValidatedBetaInvite } from "@/features/beta/betaInvite.storage";

/**
 * Rotas `/convite/:code` e `/invite/:code` — valida o convite e envia para o onboarding.
 */
export function BetaInviteLinkPage() {
  const { code: rawCode } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const code = rawCode ? decodeURIComponent(rawCode).trim() : "";

    async function run() {
      if (!code) {
        setMessage("Link de convite inválido.");
        return;
      }
      try {
        const res = await postValidateInvite(code);
        if (cancelled) return;
        if (!res.valid) {
          setMessage(res.message ?? "Convite inválido ou expirado.");
          return;
        }
        setValidatedBetaInvite(code);
        navigate("/auth/onboarding/1", { replace: true });
      } catch {
        if (!cancelled) setMessage("Não foi possível validar agora. Tenta de novo num instante.");
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [rawCode, navigate]);

  if (!message) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-5 bg-gradient-to-b from-white to-[var(--woody-sand)] px-6 text-[var(--woody-text)] antialiased">
        <WoodyLogo
          alt=""
          aria-hidden
          className="h-[7rem] w-auto max-w-[min(94vw,22rem)] object-contain object-center sm:h-[8rem] md:h-[8.5rem]"
        />
        <Loader2 className="size-8 shrink-0 animate-spin text-[var(--woody-muted)]" aria-hidden />
        <p className="text-center text-sm font-medium text-[var(--woody-muted)]">Validando o convite…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-gradient-to-b from-white to-[var(--woody-sand)] px-6 text-[var(--woody-text)] antialiased">
      <WoodyLogo
        alt=""
        aria-hidden
        className="h-[7rem] w-auto max-w-[min(94vw,22rem)] object-contain object-center sm:h-[8rem] md:h-[8.5rem]"
      />
      <h1 className="text-center text-xl font-semibold text-[var(--woody-ink)]">Convite não disponível</h1>
      <p className="max-w-md text-center text-[15px] leading-relaxed text-[var(--woody-muted)]">{message}</p>
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
        <Link
          to="/invite"
          className="rounded-xl bg-[var(--auth-button)] px-5 py-2.5 font-semibold text-[var(--woody-ink)] hover:bg-[var(--auth-button-hover)]"
        >
          Voltar ao acesso
        </Link>
        <Link to="/auth/login" className="font-medium text-[var(--woody-tag-text)] underline-offset-4 hover:underline">
          Já tenho conta
        </Link>
      </div>
    </main>
  );
}
