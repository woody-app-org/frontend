import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { formatSupportDate } from "../lib/supportHelpers";
import type { SupportTicketMessage } from "../services/support.service";

interface SupportTicketThreadProps {
  messages: SupportTicketMessage[];
  canReply: boolean;
  onReply: (body: string) => Promise<void>;
  isReplying?: boolean;
}

export function SupportTicketThread({
  messages,
  canReply,
  onReply,
  isReplying = false,
}: SupportTicketThreadProps) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = body.trim();
    if (!trimmed) {
      setError("Escreva uma mensagem.");
      return;
    }
    try {
      await onReply(trimmed);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar.");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[var(--woody-text)]">Conversa</h3>

      {messages.length === 0 ? (
        <p className="text-sm text-[var(--woody-muted)]">
          A equipe Woody ainda não respondeu. Você será notificada aqui quando houver novidades.
        </p>
      ) : (
        <ul className="space-y-3">
          {messages.map((msg) => {
            const isStaff = msg.authorRole === "Staff";
            return (
              <li
                key={msg.id}
                className={cn(
                  "rounded-xl border px-4 py-3 text-sm",
                  isStaff
                    ? "border-[var(--woody-nav)]/20 bg-[var(--woody-nav)]/[0.06]"
                    : "border-[var(--woody-accent)]/15 bg-white"
                )}
              >
                <div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs text-[var(--woody-muted)]">
                  <span className="font-medium text-[var(--woody-text)]">
                    {isStaff ? "Equipe Woody" : "Você"}
                  </span>
                  <span>·</span>
                  <time dateTime={msg.createdAt}>{formatSupportDate(msg.createdAt)}</time>
                </div>
                <p className="whitespace-pre-wrap text-[var(--woody-text)] leading-relaxed">
                  {msg.body}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      {canReply ? (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-2 pt-2">
          <label htmlFor="support-reply" className="sr-only">
            Sua resposta
          </label>
          <textarea
            id="support-reply"
            rows={3}
            maxLength={4000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Escreva sua resposta…"
            className={cn(
              "w-full rounded-xl border border-[var(--woody-accent)]/20 bg-white px-3 py-2.5 text-sm",
              woodyFocus.ring
            )}
          />
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={isReplying} className="rounded-xl">
            {isReplying ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" aria-hidden />
                Enviando…
              </>
            ) : (
              "Enviar resposta"
            )}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-[var(--woody-muted)] rounded-xl border border-[var(--woody-accent)]/12 bg-[var(--woody-bg)] px-4 py-3">
          Esta solicitação foi encerrada.
        </p>
      )}
    </div>
  );
}
