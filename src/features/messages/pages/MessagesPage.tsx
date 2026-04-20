import { useCallback, useEffect, useMemo, useState } from "react";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { woodyLayout, woodySection } from "@/lib/woody-ui";
import {
  fetchConversationMessages,
  fetchMyConversations,
  fetchPendingReceived,
  sendConversationMessage,
} from "../services/messages.service";
import { useDirectMessagesSignalR } from "../hooks/useDirectMessagesSignalR";
import type { ConversationRealtimeDto, ConversationResponseDto, MessageResponseDto } from "../types";

function sortMessages(a: MessageResponseDto, b: MessageResponseDto) {
  const t = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  if (t !== 0) return t;
  return a.id - b.id;
}

export function MessagesPage() {
  const { user, isAuthenticated } = useAuth();
  const myNumericId = user ? Number.parseInt(user.id, 10) : NaN;

  const [conversations, setConversations] = useState<ConversationResponseDto[]>([]);
  const [pendingReceived, setPendingReceived] = useState<ConversationResponseDto[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageResponseDto[]>([]);
  const [draft, setDraft] = useState("");
  const [loadingLists, setLoadingLists] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const reloadLists = useCallback(async () => {
    try {
      const [mine, pending] = await Promise.all([fetchMyConversations(), fetchPendingReceived()]);
      setConversations(mine);
      setPendingReceived(pending);
    } catch {
      /* estado mantém-se */
    } finally {
      setLoadingLists(false);
    }
  }, []);

  const reloadMessages = useCallback(async (conversationId: number) => {
    setLoadingMessages(true);
    try {
      const page = await fetchConversationMessages(conversationId, 1, 200);
      setMessages([...page.items].sort(sortMessages));
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    void reloadLists();
  }, [reloadLists]);

  useEffect(() => {
    if (selectedId == null) {
      setMessages([]);
      return;
    }
    void reloadMessages(selectedId);
  }, [selectedId, reloadMessages]);

  const mergeMessage = useCallback((next: MessageResponseDto) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === next.id);
      if (idx === -1) return [...prev, next].sort(sortMessages);
      const copy = [...prev];
      copy[idx] = next;
      return copy.sort(sortMessages);
    });
  }, []);

  const handlers = useMemo(
    () => ({
      onMessageCreated: (msg: MessageResponseDto) => {
        if (selectedId === msg.conversationId) mergeMessage(msg);
        void reloadLists();
      },
      onMessageUpdated: (msg: MessageResponseDto) => {
        if (selectedId === msg.conversationId) mergeMessage(msg);
        void reloadLists();
      },
      onMessageDeleted: (msg: MessageResponseDto) => {
        if (selectedId === msg.conversationId) mergeMessage(msg);
        void reloadLists();
      },
      onConversationUpdated: (snap: ConversationRealtimeDto) => {
        void reloadLists();
        if (selectedId === snap.id) void reloadMessages(snap.id);
      },
      onInboxChanged: () => {
        void reloadLists();
      },
    }),
    [mergeMessage, reloadLists, selectedId]
  );

  useDirectMessagesSignalR(isAuthenticated, selectedId, handlers);

  const handleSend = async () => {
    if (selectedId == null) return;
    const text = draft.trim();
    if (!text) return;
    setSendError(null);
    try {
      await sendConversationMessage(selectedId, { body: text });
      setDraft("");
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Falha ao enviar.");
    }
  };

  const combinedSidebar = [...pendingReceived, ...conversations].filter(
    (c, i, arr) => arr.findIndex((x) => x.id === c.id) === i
  );

  return (
    <FeedLayout>
      <div className={cn(woodyLayout.pagePad, "mx-auto w-full max-w-5xl pb-24 md:pb-8")}>
        <header className="mb-6">
          <h1 className={woodySection.title}>Mensagens</h1>
          <p className={woodySection.subtitle}>
            Atualização em tempo real (SignalR). A lista sincroniza quando há novos pedidos ou mensagens.
          </p>
        </header>

        <div className="grid min-h-[420px] gap-4 md:grid-cols-[minmax(0,280px)_1fr] rounded-2xl border border-[var(--woody-divider)] bg-[var(--woody-card)]/80 overflow-hidden">
          <aside className="border-b md:border-b-0 md:border-r border-[var(--woody-divider)] p-3 flex flex-col gap-2 max-h-[40vh] md:max-h-none overflow-y-auto">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--woody-muted)]">Conversas</p>
            {loadingLists ? (
              <p className="text-sm text-[var(--woody-muted)]">A carregar…</p>
            ) : combinedSidebar.length === 0 ? (
              <p className="text-sm text-[var(--woody-muted)]">Sem conversas ainda.</p>
            ) : (
              <ul className="space-y-1 list-none p-0 m-0">
                {combinedSidebar.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={cn(
                        "w-full text-left rounded-xl px-3 py-2 text-sm transition-colors",
                        selectedId === c.id
                          ? "bg-[var(--woody-nav)]/12 font-semibold text-[var(--woody-nav)]"
                          : "hover:bg-[var(--woody-nav)]/6"
                      )}
                    >
                      <span className="block truncate">{c.otherUser.displayName ?? c.otherUser.username}</span>
                      <span className="block text-xs text-[var(--woody-muted)]">
                        {c.status === "pending" ? "Pendente" : c.status === "accepted" ? "Ativa" : "Recusada"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <section className="flex flex-col min-h-[320px]">
            {selectedId == null ? (
              <div className="flex flex-1 items-center justify-center p-6 text-sm text-[var(--woody-muted)]">
                Escolhe uma conversa à esquerda.
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingMessages ? (
                    <p className="text-sm text-[var(--woody-muted)]">A carregar mensagens…</p>
                  ) : (
                    messages.map((m) => (
                      <article
                        key={m.id}
                        className={cn(
                          "max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm border",
                          m.sender.id === myNumericId
                            ? "ml-auto border-[var(--woody-nav)]/25 bg-[var(--woody-nav)]/8"
                            : "mr-auto border-[var(--woody-divider)] bg-[var(--woody-bg)]"
                        )}
                      >
                        <p className="text-xs font-medium text-[var(--woody-muted)] mb-1">
                          {m.sender.displayName ?? m.sender.username}
                          {m.isEdited ? " · editada" : ""}
                        </p>
                        {m.isDeleted ? (
                          <p className="italic text-[var(--woody-muted)]">Mensagem apagada</p>
                        ) : (
                          <>
                            {m.body ? <p className="whitespace-pre-wrap break-words">{m.body}</p> : null}
                            {m.attachments?.length ? (
                              <ul className="mt-2 space-y-1 list-none p-0">
                                {m.attachments.map((a) => (
                                  <li key={a.id}>
                                    <a
                                      href={a.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[var(--woody-nav)] underline text-xs"
                                    >
                                      Imagem
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </>
                        )}
                      </article>
                    ))
                  )}
                </div>
                <div className="border-t border-[var(--woody-divider)] p-3 space-y-2">
                  {sendError ? <p className="text-xs text-red-600">{sendError}</p> : null}
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Escreve uma mensagem…"
                    rows={2}
                    className="resize-none"
                  />
                  <Button type="button" onClick={() => void handleSend()} disabled={!draft.trim()}>
                    Enviar
                  </Button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </FeedLayout>
  );
}
