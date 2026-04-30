/** Evento de documento: pedir sincronização com a API (contador + lista se aberta). */
export const NOTIFICATIONS_SYNC_EVENT = "woody-notifications-sync";

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Agrega vários eventos SignalR (ex.: duas ligações na mesma sessão) num único refetch.
 */
export function requestNotificationsSyncFromRealtime(): void {
  if (debounceTimer != null) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    window.dispatchEvent(new Event(NOTIFICATIONS_SYNC_EVENT));
  }, 200);
}
