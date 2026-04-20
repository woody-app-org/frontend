import { useCallback, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { getDirectMessagesHubUrl, getStoredToken } from "@/lib/api";
import type {
  ConversationRealtimeDto,
  DirectMessageInboxEventDto,
  MessageResponseDto,
} from "../types";

export interface DirectMessagesSignalRHandlers {
  onMessageCreated?: (msg: MessageResponseDto) => void;
  onMessageUpdated?: (msg: MessageResponseDto) => void;
  onMessageDeleted?: (msg: MessageResponseDto) => void;
  onConversationUpdated?: (snap: ConversationRealtimeDto) => void;
  onInboxChanged?: (evt: DirectMessageInboxEventDto) => void;
}

async function syncConversationGroup(
  connection: signalR.HubConnection,
  joinedRef: { current: number | null },
  nextId: number | null
) {
  if (connection.state !== signalR.HubConnectionState.Connected) return;
  try {
    if (joinedRef.current != null && joinedRef.current !== nextId) {
      await connection.invoke("LeaveConversation", joinedRef.current);
    }
    joinedRef.current = null;
    if (nextId != null) {
      await connection.invoke("JoinConversation", nextId);
      joinedRef.current = nextId;
    }
  } catch {
    joinedRef.current = null;
  }
}

/**
 * Ligação SignalR à área de mensagens: inbox + conversa aberta (grupos validados no servidor).
 */
export function useDirectMessagesSignalR(
  enabled: boolean,
  openConversationId: number | null,
  handlers: DirectMessagesSignalRHandlers
) {
  const connRef = useRef<signalR.HubConnection | null>(null);
  const handlersRef = useRef(handlers);
  const openRef = useRef(openConversationId);
  const joinedConversationRef = useRef<number | null>(null);

  handlersRef.current = handlers;
  openRef.current = openConversationId;

  const buildConnection = useCallback(() => {
    const token = getStoredToken();
    if (!token) return null;

    const url = `${getDirectMessagesHubUrl()}?access_token=${encodeURIComponent(token)}`;
    return new signalR.HubConnectionBuilder()
      .withUrl(url, {
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        skipNegotiation: false,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();
  }, []);

  useEffect(() => {
    if (!enabled) {
      void connRef.current?.stop();
      connRef.current = null;
      joinedConversationRef.current = null;
      return;
    }

    const connection = buildConnection();
    if (!connection) return;
    connRef.current = connection;

    connection.on("messageCreated", (msg: MessageResponseDto) => handlersRef.current.onMessageCreated?.(msg));
    connection.on("messageUpdated", (msg: MessageResponseDto) => handlersRef.current.onMessageUpdated?.(msg));
    connection.on("messageDeleted", (msg: MessageResponseDto) => handlersRef.current.onMessageDeleted?.(msg));
    connection.on("conversationUpdated", (snap: ConversationRealtimeDto) =>
      handlersRef.current.onConversationUpdated?.(snap)
    );
    connection.on("inboxChanged", (evt: DirectMessageInboxEventDto) => handlersRef.current.onInboxChanged?.(evt));

    let cancelled = false;

    const afterConnected = async () => {
      if (cancelled) return;
      await connection.invoke("JoinUserInbox");
      if (cancelled) return;
      await syncConversationGroup(connection, joinedConversationRef, openRef.current);
    };

    const start = async () => {
      try {
        await connection.start();
        if (cancelled) return;
        await afterConnected();
      } catch {
        /* rede / token */
      }
    };

    connection.onreconnected(async () => {
      joinedConversationRef.current = null;
      try {
        await afterConnected();
      } catch {
        /* ignorar */
      }
    });

    void start();

    return () => {
      cancelled = true;
      void connection.stop();
      connRef.current = null;
      joinedConversationRef.current = null;
    };
  }, [enabled, buildConnection]);

  useEffect(() => {
    const connection = connRef.current;
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) return;
    void syncConversationGroup(connection, joinedConversationRef, openConversationId);
  }, [openConversationId]);
}
