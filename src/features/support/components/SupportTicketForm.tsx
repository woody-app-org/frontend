import { useState, type FormEvent } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus, woodySurface } from "@/lib/woody-ui";
import {
  SUPPORT_CATEGORY_OPTIONS,
  type SupportTicketCategory,
} from "../lib/supportHelpers";
import type { CreateSupportTicketPayload } from "../services/support.service";

interface SupportTicketFormProps {
  onSubmit: (payload: CreateSupportTicketPayload) => Promise<void>;
  isSubmitting?: boolean;
}

export function SupportTicketForm({ onSubmit, isSubmitting = false }: SupportTicketFormProps) {
  const [category, setCategory] = useState<SupportTicketCategory>("TechnicalBug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (trimmedTitle.length < 5) {
      setError("O título deve ter pelo menos 5 caracteres.");
      return;
    }
    if (trimmedDescription.length < 20) {
      setError("A descrição deve ter pelo menos 20 caracteres.");
      return;
    }

    try {
      await onSubmit({
        category,
        title: trimmedTitle,
        description: trimmedDescription,
        visibility: "Private",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar. Tente novamente.");
    }
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className={cn(
        woodySurface.card,
        "mx-auto w-full max-w-xl space-y-5 rounded-2xl border border-[var(--woody-accent)]/12 p-5 sm:p-6"
      )}
    >
      <div className="space-y-1.5">
        <label htmlFor="support-category" className="text-sm font-medium text-[var(--woody-text)]">
          Categoria
        </label>
        <select
          id="support-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as SupportTicketCategory)}
          className={cn(
            "w-full rounded-xl border border-[var(--woody-accent)]/20 bg-white px-3 py-2.5 text-sm text-[var(--woody-text)]",
            woodyFocus.ring
          )}
        >
          {SUPPORT_CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="support-title" className="text-sm font-medium text-[var(--woody-text)]">
          Título
        </label>
        <input
          id="support-title"
          type="text"
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Resuma o problema em poucas palavras"
          className={cn(
            "w-full rounded-xl border border-[var(--woody-accent)]/20 bg-white px-3 py-2.5 text-sm",
            woodyFocus.ring
          )}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="support-description" className="text-sm font-medium text-[var(--woody-text)]">
          Descrição
        </label>
        <textarea
          id="support-description"
          rows={6}
          maxLength={4000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explique o que aconteceu e o que você esperava..."
          className={cn(
            "w-full resize-y rounded-xl border border-[var(--woody-accent)]/20 bg-white px-3 py-2.5 text-sm",
            woodyFocus.ring
          )}
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-[var(--woody-text)]">Privacidade</legend>
        <label className="flex items-start gap-2 rounded-xl border border-[var(--woody-nav)]/25 bg-[var(--woody-nav)]/[0.04] px-3 py-3 text-sm">
          <input type="radio" name="visibility" checked readOnly className="mt-1" />
          <span>
            <span className="font-medium text-[var(--woody-text)]">Privado</span>
            <span className="block text-xs text-[var(--woody-muted)]">
              Apenas você e a equipe Woody
            </span>
          </span>
        </label>
        <label className="flex items-start gap-2 rounded-xl border border-[var(--woody-accent)]/12 px-3 py-3 text-sm opacity-60 cursor-not-allowed">
          <input type="radio" name="visibility" disabled className="mt-1" />
          <span>
            <span className="font-medium text-[var(--woody-text)]">Público</span>
            <span className="block text-xs text-[var(--woody-muted)]">Em breve</span>
          </span>
        </label>
      </fieldset>

      <div
        className="flex gap-2 rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-3 text-sm text-amber-950"
        role="note"
      >
        <AlertTriangle className="size-4 shrink-0 mt-0.5" aria-hidden />
        <p>
          Não compartilhe senhas, documentos, CPF ou dados sensíveis por aqui.
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
  );
}
