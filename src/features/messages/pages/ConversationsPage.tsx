import { useCallback, useEffect, useMemo, useState } from "react";
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
import { sortConversationsByActivity } from "../lib/sortConversations";
import { sortMessagesChronological } from "../lib/sortMessages";

export function ConversationsPage() {
  const navigate = useNavigate();
  const { conversationId: conversationIdParam } = useParams<{ conversationId?: string }>();
  const routeConversationId = useMemo(() => {
    if (!conversationIdParam) return null;
    const n = Number.parseInt(conversationIdParam, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [conversationIdParam]);

  const { user, isAuthenticated } = useAuth();
  const myNumericId = user ? Number.parseInt(user.id, 10) : NaN;

  const [conversations, setConversations] = useState<ConversationResponseDto[]>([]);
  const [pendingReceived, setPendingReceived] = useState<ConversationResponseDto[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageResponseDto[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [actionBusyId, setActionBusyId] = useState<number | null>(null);

  const reloadLists = useCallback(async () => {
    try {
      const [mine, pending] = await Promise.all([fetchMyConversations(), fetchPendingReceived()]);
      setConversations([...mine].sort(sortConversationsByActivity));
      setPendingReceived([...pending].sort(sortConversationsByActivity));
    } catch {
      /* mantém estado */
    } finally {
      setLoadingLists(false);
    }
  }, []);

  const reloadMessages = useCallback(async (conversationId: number) => {
    setLoadingMessages(true);
    try {
      const page = await fetchConversationMessages(conversationId, 1, 200);
      setMessages([...page.items].sort(sortMessagesChronological));
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
    <FeedLayout>
      <div className={cn(woodyLayout.pagePad, "mx-auto w-full max-w-6xl pb-28 md:pb-8")}>
        <header className="mb-5 md:mb-6">
          <h1 className={woodySection.title}>Conversas</h1>
          <p className={woodySection.subtitle}>
            Inbox com pedidos e conversas. Atualiza em tempo real; abre um chat para ver o histórico completo.
          </p>
          {sendError ? (
            <p className="mt-3 max-w-xl text-sm text-red-600" role="alert">
              {sendError}
            </p>
          ) : null}
        </header>

        <div
          className={cn(
            "grid min-h-[min(70dvh,640px)] overflow-hidden rounded-2xl border border-[var(--woody-divider)] bg-[var(--woody-card)]/85 shadow-[0_1px_3px_rgba(58,45,36,0.06)]",
            "md:grid-cols-[minmax(0,320px)_1fr]"
          )}
        >
          <div
            className={cn(
              "flex max-h-[min(72dvh,720px)] min-h-0 flex-col gap-6 overflow-y-auto border-[var(--woody-divider)] p-4 md:border-r",
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
          </div>

          <div
            className={cn(
              "min-h-[min(60dvh,560px)] min-w-0 border-t border-[var(--woody-divider)] md:border-t-0 md:border-l-0",
              !showMobileChat && "hidden md:flex"
            )}
          >
            {selectedId == null ? (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-2 p-8 text-center">
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
                myNumericId={myNumericId}
                onSendMessage={handleSendMessage}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
                onBack={() => navigate("/messages")}
              />
            )}
          </div>
        </div>
      </div>
    </FeedLayout>
  );
}
