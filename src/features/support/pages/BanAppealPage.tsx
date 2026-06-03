import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus, woodySurface } from "@/lib/woody-ui";
import { submitBanAppeal, BAN_APPEAL_SUCCESS_MESSAGE } from "../services/banAppeal.service";

export function BanAppealPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState(BAN_APPEAL_SUCCESS_MESSAGE);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedDescription = description.trim();

    if (!trimmedEmail) {
      setError("Informe o e-mail da conta.");
      return;
    }
    if (trimmedDescription.length < 20) {
      setError("A descrição deve ter pelo menos 20 caracteres.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitBanAppeal({
        email: trimmedEmail,
        name: name.trim() || undefined,
        description: trimmedDescription,
        website: honeypot,
      });
      setSuccessMessage(result.message || BAN_APPEAL_SUCCESS_MESSAGE);
      setSubmitted(true);
    } catch {
      setError("Não foi possível enviar agora. Tente novamente em alguns minutos.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <article
        className={cn(
          woodySurface.card,
          "w-full max-w-lg rounded-2xl border border-[var(--woody-accent)]/12 p-5 sm:p-8 shadow-sm"
        )}
      >
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--woody-nav)] hover:underline mb-5"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Voltar ao login
        </Link>

        {submitted ? (
          <div className="space-y-4 text-center py-4">
            <CheckCircle2
              className="size-12 mx-auto text-[var(--woody-nav)]"
              aria-hidden
            />
            <h1 className="text-xl font-bold text-[var(--woody-text)]">
              Recebemos sua solicitação
            </h1>
            <p className="text-sm text-[var(--woody-muted)] leading-relaxed">
              {successMessage}
            </p>
          </div>
        ) : (
          <>
            <header className="space-y-2 mb-6">
              <h1 className="text-xl font-bold text-[var(--woody-text)]">
                Solicitar revisão de conta
              </h1>
              <p className="text-sm text-[var(--woody-muted)] leading-relaxed">
                Se você acredita que sua conta foi desativada por engano, envie uma
                solicitação para a equipe da Woody analisar.
              </p>
            </header>

            <form noValidate onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <div className="sr-only" aria-hidden>
                <label htmlFor="ban-appeal-hp">Deixe em branco</label>
                <input
                  id="ban-appeal-hp"
                  name="fax"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="ban-appeal-email" className="text-sm font-medium">
                  E-mail da conta
                </label>
                <input
                  id="ban-appeal-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "w-full rounded-xl border border-[var(--woody-accent)]/20 px-3 py-2.5 text-sm",
                    woodyFocus.ring
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="ban-appeal-name" className="text-sm font-medium">
                  Nome <span className="text-[var(--woody-muted)] font-normal">(opcional)</span>
                </label>
                <input
                  id="ban-appeal-name"
                  type="text"
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={cn(
                    "w-full rounded-xl border border-[var(--woody-accent)]/20 px-3 py-2.5 text-sm",
                    woodyFocus.ring
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="ban-appeal-description" className="text-sm font-medium">
                  Descrição
                </label>
                <textarea
                  id="ban-appeal-description"
                  required
                  rows={5}
                  maxLength={4000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explique por que acredita que houve um engano…"
                  className={cn(
                    "w-full resize-y rounded-xl border border-[var(--woody-accent)]/20 px-3 py-2.5 text-sm",
                    woodyFocus.ring
                  )}
                />
              </div>

              <div
                className="flex gap-2 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-3 text-sm text-amber-950"
                role="note"
              >
                <AlertTriangle className="size-4 shrink-0 mt-0.5" aria-hidden />
                <p>
                  Não envie senhas, documentos ou dados sensíveis por este formulário.
                </p>
              </div>

              {error ? (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl h-11 font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" aria-hidden />
                    Enviando…
                  </>
                ) : (
                  "Enviar solicitação"
                )}
              </Button>
            </form>
          </>
        )}
      </article>
    </AuthLayout>
  );
}
