import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import woodyCat from "@/assets/new-cat.png";
import { postValidateInvite } from "@/features/beta/betaInvite.api";
import { setValidatedBetaInvite } from "@/features/beta/betaInvite.storage";

type GateStatus = "idle" | "loading" | "error" | "success";

const COPY = {
  title: "A Woody está quase pronta.",
  subtitle:
    "Estamos abrindo o acesso aos poucos para construir uma experiência segura, leve e feita para conexões reais.",
  fieldLabel: "Código de convite",
  submit: "Entrar com convite",
  secondaryLink: "Já tenho conta",
  helper: "Se recebeu um link, abra-o neste navegador para liberar o acesso.",
  loading: "A verificar convite...",
  success: "Convite validado. Vamos começar.",
  invalidInvite: "Convite inválido ou expirado. Verifique o código recebido.",
  emptyCode: "Insira o código de convite.",
  networkError: "Não foi possível verificar agora. Tente de novo num instante.",
} as const;

/**
 * Lançamento controlado — entrada manual do código de convite.
 */
export function BetaGatePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<GateStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "success") return;
    const t = window.setTimeout(() => {
      navigate("/auth/onboarding/1", { replace: true });
    }, 720);
    return () => window.clearTimeout(t);
  }, [navigate, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setErrorMessage(COPY.emptyCode);
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMessage(null);
    try {
      const res = await postValidateInvite(trimmed);
      if (!res.valid) {
        setErrorMessage(COPY.invalidInvite);
        setStatus("error");
        return;
      }
      setValidatedBetaInvite(trimmed);
      setStatus("success");
    } catch {
      setErrorMessage(COPY.networkError);
      setStatus("error");
    }
  };

  const isBusy = status === "loading" || status === "success";

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-gradient-to-b from-white via-[var(--woody-sand)]/75 to-[rgba(var(--woody-lime-rgb),0.08)] text-[var(--woody-text)] antialiased">
      {/* Fundo suave + detalhe verde — não parece página de erro */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(var(--woody-lime-rgb),0.14),transparent_50%)] motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-[min(40vw,220px)] top-1/4 size-[min(85vw,420px)] rounded-full bg-[rgba(var(--woody-lime-rgb),0.07)] blur-3xl motion-safe:animate-[pulse_8s_ease-in-out_infinite]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-[min(35vw,180px)] bottom-[12%] size-[min(75vw,360px)] rounded-full bg-[rgba(var(--woody-lime-rgb),0.06)] blur-3xl motion-safe:animate-[pulse_10s_ease-in-out_infinite_1s]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-md flex-col justify-center px-4 py-10 sm:px-6 sm:py-14">
        {/* Cabeçalho */}
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 mb-8 flex flex-col items-center sm:mb-10">
          <div className="mb-6 flex justify-center">
            <img
              src={woodyCat}
              alt="Woody"
              width={1598}
              height={1443}
              className="h-[7rem] w-auto max-w-[min(94vw,22rem)] object-contain object-center select-none sm:h-[8rem] md:h-[8.5rem]"
              decoding="async"
              draggable={false}
            />
          </div>

          <h1 className="text-center font-sans text-[1.65rem] font-semibold leading-tight tracking-tight text-[var(--woody-ink)] sm:text-[1.85rem]">
            {COPY.title}
          </h1>
          <p className="mt-4 max-w-[26rem] text-center text-[0.9375rem] leading-relaxed text-[var(--woody-muted)] sm:text-base">
            {COPY.subtitle}
          </p>
        </div>

        {/* Card central */}
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 motion-safe:delay-75">
          <form
            onSubmit={handleSubmit}
            className={cn(
              "rounded-[1.35rem] border border-black/[0.06] bg-[var(--woody-card)]/95 p-6 shadow-[0_24px_48px_-28px_rgba(10,10,10,0.14),0_0_0_1px_rgba(var(--woody-lime-rgb),0.06)] backdrop-blur-md sm:p-8",
              "ring-1 ring-[rgba(var(--woody-lime-rgb),0.12)]"
            )}
          >
            <label
              htmlFor="beta-invite-code"
              className="block text-sm font-medium tracking-tight text-[var(--woody-ink)]"
            >
              {COPY.fieldLabel}
            </label>
            <input
              id="beta-invite-code"
              type="text"
              autoComplete="off"
              spellCheck={false}
              disabled={isBusy}
              value={code}
              onChange={(ev) => {
                setCode(ev.target.value);
                if (status === "error") {
                  setStatus("idle");
                  setErrorMessage(null);
                }
              }}
              placeholder="Cole ou digite o seu código"
              className={cn(
                "mt-2.5 min-h-[48px] w-full rounded-xl border border-black/[0.08] bg-white px-4 py-3 text-base tracking-wide text-[var(--woody-ink)] shadow-[inset_0_1px_2px_rgba(10,10,10,0.04)] outline-none transition placeholder:text-zinc-400",
                "focus:border-[var(--auth-button)] focus:ring-[3px] focus:ring-[rgba(var(--woody-lime-rgb),0.22)]",
                "disabled:cursor-not-allowed disabled:opacity-60"
              )}
              aria-invalid={!!errorMessage}
              aria-describedby={errorMessage ? "beta-invite-feedback" : undefined}
            />

            <div id="beta-invite-feedback" className="mt-3 min-h-[1.25rem]" role="status" aria-live="polite">
              {errorMessage ? (
                <p
                  className="rounded-xl border border-amber-200/90 bg-amber-50/95 px-3.5 py-2.5 text-sm leading-snug text-amber-950/90 shadow-sm"
                  role="alert"
                >
                  {errorMessage}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isBusy}
              className={cn(
                "mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-4 text-base font-semibold shadow-[0_8px_24px_-12px_rgba(var(--woody-lime-rgb),0.65)] transition",
                "bg-[var(--auth-button)] text-[var(--woody-ink)] hover:bg-[var(--auth-button-hover)] active:scale-[0.99]",
                "disabled:pointer-events-none disabled:opacity-75",
                status === "success" && "bg-[rgba(var(--woody-lime-rgb),0.35)] ring-2 ring-[var(--auth-button)]/40"
              )}
              aria-busy={status === "loading"}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="size-5 shrink-0 animate-spin" aria-hidden />
                  <span>{COPY.loading}</span>
                </>
              ) : status === "success" ? (
                <>
                  <Check className="size-5 shrink-0 motion-safe:animate-in motion-safe:zoom-in-95" aria-hidden />
                  <span>{COPY.success}</span>
                </>
              ) : (
                COPY.submit
              )}
            </button>

            <p className="mt-6 text-center">
              <Link
                to="/auth/login"
                className="text-sm font-medium text-[var(--woody-tag-text)] underline-offset-4 transition hover:text-[var(--woody-ink)] hover:underline"
              >
                {COPY.secondaryLink}
              </Link>
            </p>
          </form>

          <p className="mx-auto mt-8 max-w-[22rem] text-center text-xs leading-relaxed text-[var(--woody-muted)] sm:text-[0.8125rem]">
            {COPY.helper}
          </p>
        </div>
      </div>
    </main>
  );
}
