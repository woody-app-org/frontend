import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import type { ConversationPeerPreviewDto, MessageResponseDto } from "../types";

export interface ConversationChatPanelProps {
  peer: ConversationPeerPreviewDto | null;
  messages: MessageResponseDto[];
  loadingMessages: boolean;
  myNumericId: number;
  draft: string;
  onDraftChange: (v: string) => void;
  sendError: string | null;
  onSend: () => void;
  onBack: () => void;
}

export function ConversationChatPanel({
  peer,
  messages,
  loadingMessages,
  myNumericId,
  draft,
  onDraftChange,
  sendError,
  onSend,
  onBack,
}: ConversationChatPanelProps) {
  const label = peer ? peer.displayName ?? peer.username : "Conversa";

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--woody-bg)]">
      <header className="flex shrink-0 items-center gap-2 border-b border-[var(--woody-divider)] px-2 py-3 md:px-4">
        <button
          type="button"
          onClick={onBack}
          className={cn(
            woodyFocus.ring,
            "inline-flex size-10 items-center justify-center rounded-full text-[var(--woody-text)] hover:bg-[var(--woody-nav)]/10 md:hidden"
          )}
          aria-label="Voltar à lista"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[var(--woody-text)]">{label}</p>
          {peer ? (
            <Link
              to={`/profile/${peer.id}`}
              className="text-xs font-medium text-[var(--woody-nav)] underline-offset-2 hover:underline"
            >
              Ver perfil
            </Link>
          ) : null}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 md:p-4">
        {loadingMessages ? (
          <p className="text-sm text-[var(--woody-muted)]">A carregar mensagens…</p>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--woody-muted)]">Ainda não há mensagens nesta conversa.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {messages.map((m) => (
              <li
                key={m.id}
                className={cn(
                  "max-w-[min(100%,28rem)] rounded-2xl border px-3 py-2 text-sm shadow-sm",
                  m.sender.id === myNumericId
                    ? "self-end border-[var(--woody-nav)]/22 bg-[var(--woody-nav)]/8"
                    : "self-start border-[var(--woody-divider)] bg-[var(--woody-card)]"
                )}
              >
                <p className="mb-1 text-xs font-medium text-[var(--woody-muted)]">
                  {m.sender.displayName ?? m.sender.username}
                  {m.isEdited ? " · editada" : ""}
                </p>
                {m.isDeleted ? (
                  <p className="italic text-[var(--woody-muted)]">Mensagem apagada</p>
                ) : (
                  <>
                    {m.body ? <p className="whitespace-pre-wrap break-words">{m.body}</p> : null}
                    {m.attachments?.length ? (
                      <ul className="mt-2 list-none space-y-1 p-0">
                        {m.attachments.map((a) => (
                          <li key={a.id}>
                            <a
                              href={a.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-medium text-[var(--woody-nav)] underline"
                            >
                              Ver imagem
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer className="shrink-0 border-t border-[var(--woody-divider)] bg-[var(--woody-header)]/40 p-3 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none">
        {sendError ? <p className="mb-2 text-xs text-red-600">{sendError}</p> : null}
        <div className="flex flex-col gap-2 md:flex-row md:items-end">
          <Textarea
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            placeholder="Mensagem…"
            rows={2}
            className="min-h-[44px] flex-1 resize-none md:min-h-0"
          />
          <Button type="button" className="min-h-10 w-full shrink-0 md:w-auto" onClick={onSend} disabled={!draft.trim()}>
            Enviar
          </Button>
        </div>
      </footer>
    </div>
  );
}
