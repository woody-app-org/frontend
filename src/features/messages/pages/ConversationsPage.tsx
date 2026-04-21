import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  acceptConversationRequest,
  deleteConversationMessage,
  editConversationMessage,
  fetchConversationMessages,
  fetchMyConversations,
  fetchPendingReceived,
  rejectConversationRequest,
  sendConversationMessage,
} from "../services/messages.service";
import { useDirectMessagesSignalR } from "../hooks/useDirectMessagesSignalR";
import type { ConversationRealtimeDto, ConversationResponseDto, MessageResponseDto } from "../types";
import { woodyLayout, woodySection } from "@/lib/woody-ui";
import { cn } from "@/lib/utils";
import { ConversationList } from "../components/ConversationList";
import { ConversationRequestsSection } from "../components/ConversationRequestsSection";
import { ConversationChatPanel } from "../components/ConversationChatPanel";
import { ConversationStartHints } from "../components/ConversationStartHints";
import { sortConversationsByActivity } from "../lib/sortConversations";
import { sortMessagesChronological } from "../lib/sortMessages";
import { DM_MESSAGES_MAX_PAGE_SIZE } from "../lib/dmLimits";

export function ConversationsPage() {
  const navigate = useNavigate();
  const { conversationId: conversationIdParam } = useParams<{ conversationId?: string }>();
  const routeConversationId = useMemo(() => {
    if (!conversationIdParam) return null;
    const n = Number.parseInt(conversationIdParam, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [conversationIdParam]);

  const { user, isAuthenticated } = useAuth();

  const [conversations, setConversations] = useState<ConversationResponseDto[]>([]);
  const [pendingReceived, setPendingReceived] = useState<ConversationResponseDto[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageResponseDto[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [listLoadError, setListLoadError] = useState<string | null>(null);
  const [messagesLoadError, setMessagesLoadError] = useState<string | null>(null);
  const [actionBusyId, setActionBusyId] = useState<number | null>(null);
  const listsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reloadLists = useCallback(async () => {
    try {
      const [mine, pending] = await Promise.all([fetchMyConversations(), fetchPendingReceived()]);
      setListLoadError(null);
      setConversations([...mine].sort(sortConversationsByActivity));
      setPendingReceived([...pending].sort(sortConversationsByActivity));
    } catch {
      setListLoadError("Não foi possível atualizar a lista de conversas.");
    } finally {
      setLoadingLists(false);
    }
  }, []);

  const scheduleReloadLists = useCallback(() => {
    if (listsDebounceRef.current != null) {
      clearTimeout(listsDebounceRef.current);
    }
    listsDebounceRef.current = setTimeout(() => {
      listsDebounceRef.current = null;
      void reloadLists();
    }, 220);
  }, [reloadLists]);

  const reloadMessages = useCallback(async (conversationId: number) => {
    setLoadingMessages(true);
    setMessagesLoadError(null);
    try {
      const page = await fetchConversationMessages(conversationId, 1, DM_MESSAGES_MAX_PAGE_SIZE);
      setMessages([...page.items].sort(sortMessagesChronological));
    } catch {
      setMessages([]);
      setMessagesLoadError("Não foi possível carregar as mensagens desta conversa.");
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    void reloadLists();
  }, [reloadLists]);

  useEffect(
    () => () => {
      if (listsDebounceRef.current != null) {
        clearTimeout(listsDebounceRef.current);
        listsDebounceRef.current = null;
      }
    },
    []
  );

  useEffect(() => {
    setSelectedId(routeConversationId);
  }, [routeConversationId]);

  useEffect(() => {
    if (selectedId == null) {
      setMessages([]);
      return;
    }
    void reloadMessages(selectedId);
  }, [selectedId, reloadMessages]);

  const mergeMessage = useCallback((next: MessageResponseDto) => {
    if (!next || next.id < 1) return;
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === next.id);
      if (idx === -1) return [...prev, next].sort(sortMessagesChronological);
      const copy = [...prev];
      copy[idx] = next;
      return copy.sort(sortMessagesChronological);
    });
  }, []);

  const handlers = useMemo(
    () => ({
      onMessageCreated: (msg: MessageResponseDto) => {
        if (selectedId === msg.conversationId) mergeMessage(msg);
        scheduleReloadLists();
      },
      onMessageUpdated: (msg: MessageResponseDto) => {
        if (selectedId === msg.conversationId) mergeMessage(msg);
        scheduleReloadLists();
      },
      onMessageDeleted: (msg: MessageResponseDto) => {
        if (selectedId === msg.conversationId) mergeMessage(msg);
        scheduleReloadLists();
      },
      onConversationUpdated: (snap: ConversationRealtimeDto) => {
        void reloadLists();
        if (selectedId === snap.id) void reloadMessages(snap.id);
      },
      onInboxChanged: () => {
        scheduleReloadLists();
      },
    }),
    [mergeMessage, reloadLists, reloadMessages, scheduleReloadLists, selectedId]
  );

  useDirectMessagesSignalR(isAuthenticated, selectedId, handlers);

  const acceptedOnly = useMemo(
    () => conversations.filter((c) => c.status === "accepted").sort(sortConversationsByActivity),
    [conversations]
  );

  const outgoingPending = useMemo(
    () => conversations.filter((c) => c.status === "pending").sort(sortConversationsByActivity),
    [conversations]
  );

  const activePeer = useMemo(() => {
    if (selectedId == null) return null;
    const all = [...pendingReceived, ...conversations];
    return all.find((c) => c.id === selectedId)?.otherUser ?? null;
  }, [selectedId, pendingReceived, conversations]);

  const openConversation = useCallback(
    (id: number) => {
      navigate(`/messages/${id}`);
    },
    [navigate]
  );

  const handleAccept = async (id: number) => {
    setSendError(null);
    setActionBusyId(id);
    try {
      await acceptConversationRequest(id);
      await reloadLists();
      openConversation(id);
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Não foi possível aceitar.");
    } finally {
      setActionBusyId(null);
    }
  };

  const handleReject = async (id: number) => {
    setSendError(null);
    setActionBusyId(id);
    try {
      await rejectConversationRequest(id);
      await reloadLists();
      if (selectedId === id) navigate("/messages");
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Não foi possível recusar.");
    } finally {
      setActionBusyId(null);
    }
  };

  const handleSendMessage = async (payload: {
    body?: string | null;
    attachmentUrls?: string[] | null;
  }) => {
    if (selectedId == null) return;
    const msg = await sendConversationMessage(selectedId, payload);
    mergeMessage(msg);
    void reloadLists();
  };

  const handleEditMessage = async (messageId: number, body: string) => {
    if (selectedId == null) return;
    const msg = await editConversationMessage(selectedId, messageId, body);
    mergeMessage(msg);
    void reloadLists();
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (selectedId == null) return;
    await deleteConversationMessage(selectedId, messageId);
    await reloadMessages(selectedId);
    await reloadLists();
  };

  const showMobileChat = Boolean(routeConversationId);

  return (
    <FeedLayout showRightPanel={false}>
      <div
        className={cn(
          woodyLayout.pagePad,
          "mx-auto flex w-full max-w-6xl flex-col gap-5 pb-28 md:min-h-0 md:gap-6 md:pb-8",
          /* Altura fixa no desktop: o scroll fica dentro do chat/lista, não na página inteira. */
          "md:h-[calc(100dvh-7rem)] md:max-h-[calc(100dvh-7rem)]",
          /* Mobile com chat aberto: limita altura para o histórico rolar dentro do painel. */
          showMobileChat && "min-h-0 max-h-[calc(100dvh-7.5rem)] flex-1"
        )}
      >
        <header className="shrink-0 md:mb-0">
          <h1 className={woodySection.title}>Conversas</h1>
          <p className={woodySection.subtitle}>
            Inbox com pedidos e conversas (atualiza em tempo real). Para falar com alguém, usa <strong className="font-medium text-[var(--woody-text)]">Mensagem</strong> no perfil dela ou os atalhos abaixo.
          </p>
          {sendError ? (
            <p className="mt-3 max-w-xl text-sm text-red-600" role="alert">
              {sendError}
            </p>
          ) : null}
          {listLoadError ? (
            <div className="mt-3 flex max-w-xl flex-col gap-2 rounded-xl border border-amber-200/60 bg-amber-500/10 p-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between">
              <p className="min-w-0 flex-1 leading-snug">{listLoadError}</p>
              <button
                type="button"
                className="shrink-0 rounded-lg bg-[var(--woody-nav)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-95"
                onClick={() => void reloadLists()}
              >
                Atualizar lista
              </button>
            </div>
          ) : null}
        </header>

        <div
          className={cn(
            "grid min-h-0 flex-1 overflow-hidden rounded-2xl border border-[var(--woody-divider)] bg-[var(--woody-card)]/85 shadow-[0_1px_3px_rgba(58,45,36,0.06)]",
            "min-h-[min(52dvh,420px)] md:min-h-0",
            "md:grid-cols-[minmax(0,320px)_1fr] md:h-full md:max-h-full"
          )}
        >
          <div
            className={cn(
              "flex h-full min-h-0 flex-col gap-6 overflow-y-auto border-[var(--woody-divider)] p-4 md:border-r",
              showMobileChat && "hidden md:flex"
            )}
          >
            <ConversationRequestsSection
              items={pendingReceived}
              selectedId={selectedId}
              loading={loadingLists}
              actionBusyId={actionBusyId}
              onOpen={openConversation}
              onAccept={(id) => void handleAccept(id)}
              onReject={(id) => void handleReject(id)}
            />

            <ConversationList
              title="Conversas ativas"
              items={acceptedOnly}
              selectedId={selectedId}
              onSelect={openConversation}
              loading={loadingLists}
              emptyLabel="Ainda não tens conversas aceites."
            />

            {outgoingPending.length > 0 ? (
              <ConversationList
                title="Pedidos enviados"
                items={outgoingPending}
                selectedId={selectedId}
                onSelect={openConversation}
                loading={loadingLists}
                emptyLabel=""
              />
            ) : null}

            {!loadingLists && acceptedOnly.length === 0 ? (
              <ConversationStartHints enabled />
            ) : null}
          </div>

          <div
            className={cn(
              "flex h-full min-h-0 min-w-0 flex-col overflow-hidden border-t border-[var(--woody-divider)] md:border-t-0 md:border-l-0",
              !showMobileChat && "hidden md:flex"
            )}
          >
            {selectedId == null ? (
              <div className="flex h-full min-h-[min(40dvh,280px)] flex-col items-center justify-center gap-2 p-8 text-center">
                <p className="text-sm font-medium text-[var(--woody-text)]">Escolhe uma conversa</p>
                <p className="max-w-xs text-sm text-[var(--woody-muted)]">
                  No telemóvel, toca num contacto na lista. No desktop, vê a lista à esquerda e o chat aqui.
                </p>
              </div>
            ) : (
              <ConversationChatPanel
                key={selectedId}
                peer={activePeer}
                messages={messages}
                loadingMessages={loadingMessages}
                messagesLoadError={messagesLoadError}
                currentUserId={user?.id}
                onSendMessage={handleSendMessage}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
                onRetryMessages={() => {
                  if (selectedId != null) void reloadMessages(selectedId);
                }}
                onBack={() => navigate("/messages")}
              />
            )}
          </div>
        </div>
      </div>
    </FeedLayout>
  );
}
