import { useCallback, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { getDirectMessagesHubUrl, getStoredToken } from "@/lib/api";
import { requestNotificationsSyncFromRealtime } from "../lib/notificationsRealtimeBus";

/**
 * Ligação leve ao hub de DMs só para o grupo de inbox (sem JoinConversation).
 * Usar quando a página de mensagens não está ativa — lá o `useDirectMessagesSignalR` já cobre o mesmo evento.
 */
export function useNotificationsInboxSignalR(enabled: boolean) {
  const connRef = useRef<signalR.HubConnection | null>(null);

  const buildConnection = useCallback(() => {
    const token = getStoredToken();
    if (!token) return null;

    const url = getDirectMessagesHubUrl();
    return new signalR.HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => getStoredToken() ?? "",
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
      return;
    }

    const connection = buildConnection();
    if (!connection) return;
    connRef.current = connection;

    connection.on("notificationsChanged", () => {
      requestNotificationsSyncFromRealtime();
    });

    let cancelled = false;

    const afterConnected = async () => {
      if (cancelled) return;
      await connection.invoke("JoinUserInbox");
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
    };
  }, [enabled, buildConnection]);
}
