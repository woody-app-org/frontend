import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import type { ConversationPeerPreviewDto, MessageResponseDto, OutgoingMessageAttachment } from "../types";
import { DmComposer } from "./DmComposer";
import { DmMessageList } from "./DmMessageList";

function peerInitials(peer: ConversationPeerPreviewDto | null): string {
  const base = peer?.displayName?.trim() || peer?.username?.trim() || "?";
  return base
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export interface ConversationChatPanelProps {
  conversationId: number;
  peer: ConversationPeerPreviewDto | null;
  messages: MessageResponseDto[];
  loadingMessages: boolean;
  messagesLoadError: string | null;
  currentUserId: string | undefined;
  onSendMessage: (payload: {
    body?: string | null;
    attachmentUrls?: string[] | null;
    attachments?: OutgoingMessageAttachment[] | null;
  }) => Promise<void>;
  onEditMessage: (messageId: number, body: string) => Promise<void>;
  onDeleteMessage: (messageId: number) => Promise<void>;
  onRetryMessages: () => void;
  onBack: () => void;
}

export function ConversationChatPanel({
  conversationId,
  peer,
  messages,
  loadingMessages,
  messagesLoadError,
  currentUserId,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onRetryMessages,
  onBack,
}: ConversationChatPanelProps) {
  const label = peer ? peer.displayName ?? peer.username : "Conversa";
  const [mutationHint, setMutationHint] = useState<string | null>(null);
  const composerBlocked = loadingMessages || Boolean(messagesLoadError);

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col bg-[var(--woody-bg)]">
      <header
        className={cn(
          "flex shrink-0 items-center gap-2 border-b border-[var(--woody-divider)] px-2 py-3 md:px-4",
          "max-md:border-[var(--woody-divider)]/80 max-md:bg-[var(--woody-bg)]/95 max-md:backdrop-blur-sm max-md:pt-[max(0.5rem,env(safe-area-inset-top))]"
        )}
      >
        <button
          type="button"
          onClick={onBack}
          className={cn(
            woodyFocus.ring,
            "inline-flex size-10 shrink-0 items-center justify-center rounded-full text-[var(--woody-text)] hover:bg-[var(--woody-nav)]/10 md:hidden"
          )}
          aria-label="Sair da conversa"
        >
          <ChevronLeft className="size-5" strokeWidth={2} />
        </button>
        {peer ? (
          <Link
            to={`/profile/${peer.id}`}
            aria-label={`Perfil de ${label}`}
            className={cn(
              woodyFocus.ring,
              "flex min-w-0 flex-1 items-center gap-2.5 rounded-xl py-1 pr-1 -my-0.5 md:hidden",
              "hover:bg-[var(--woody-nav)]/8 transition-colors"
            )}
          >
            <Avatar className="size-9 shrink-0 ring-1 ring-[var(--woody-divider)]/60">
              <AvatarImage src={peer.profilePic ?? undefined} alt="" />
              <AvatarFallback className="bg-[var(--woody-nav)]/12 text-xs font-semibold text-[var(--woody-text)]">
                {peerInitials(peer)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-left text-base font-semibold leading-tight text-[var(--woody-text)]">
              {label}
            </span>
          </Link>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-2.5 py-1 md:hidden">
            <Avatar className="size-9 shrink-0 ring-1 ring-[var(--woody-divider)]/60">
              <AvatarFallback className="bg-[var(--woody-nav)]/12 text-xs font-semibold text-[var(--woody-text)]">
                {peerInitials(null)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-base font-semibold text-[var(--woody-text)]">{label}</span>
          </div>
        )}
        <div className="hidden min-w-0 flex-1 md:block">
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

      {mutationHint ? (
        <div
          role="status"
          className="flex shrink-0 items-start justify-between gap-2 border-b border-red-200/40 bg-red-500/8 px-3 py-2 text-xs text-red-800"
        >
          <p className="min-w-0 flex-1 leading-snug">{mutationHint}</p>
          <button
            type="button"
            className={cn(woodyFocus.ring, "shrink-0 rounded px-1 font-medium underline underline-offset-2")}
            onClick={() => setMutationHint(null)}
          >
            Fechar
          </button>
        </div>
      ) : null}

      {messagesLoadError && !loadingMessages ? (
        <div
          role="alert"
          className="flex shrink-0 flex-col gap-2 border-b border-amber-200/50 bg-amber-500/10 px-3 py-3 text-sm text-amber-950"
        >
          <p className="leading-snug">{messagesLoadError}</p>
          <button
            type="button"
            className={cn(
              woodyFocus.ring,
              "self-start rounded-lg bg-[var(--woody-nav)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-95"
            )}
            onClick={() => onRetryMessages()}
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      {loadingMessages ? (
        <div className="flex min-h-0 flex-1 items-center justify-center p-6">
          <p className="text-sm text-[var(--woody-muted)]">A carregar mensagens…</p>
        </div>
      ) : messagesLoadError ? (
        <div className="min-h-0 flex-1 bg-[var(--woody-bg)]/50" aria-hidden />
      ) : messages.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
          <p className="text-sm font-medium text-[var(--woody-text)]">Ainda não há mensagens</p>
          <p className="max-w-xs text-sm text-[var(--woody-muted)]">Envia uma mensagem ou anexa imagem, vídeo ou GIF para iniciar a conversa.</p>
        </div>
      ) : (
        <DmMessageList
          messages={messages}
          currentUserId={currentUserId}
          onSaveEdit={onEditMessage}
          onDelete={onDeleteMessage}
          onMutationError={(msg) => setMutationHint(msg)}
        />
      )}

      <DmComposer conversationId={conversationId} disabled={composerBlocked} onSend={onSendMessage} />
    </div>
  );
}
