import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { handleNotificationClick } from "../lib/notificationNavigation";
import type { NotificationItem } from "../services/notifications.service";
import { useNotifications } from "../hooks/useNotifications";
import { NotificationsList } from "./NotificationsList";

export interface NotificationsPanelProps {
  /** Painel visível (popover/modal aberto). */
  isOpen: boolean;
  viewerUserId: string;
  onAfterRead?: () => void;
  onRequestClose: () => void;
  signalsHref: string;
  signalsUnreadCount: number;
}

/**
 * Conteúdo do popover/modal: lista + atalho para sinais recebidos.
 */
export function NotificationsPanel({
  isOpen,
  viewerUserId,
  onAfterRead,
  onRequestClose,
  signalsHref,
  signalsUnreadCount,
}: NotificationsPanelProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    items,
    filteredItems,
    filter,
    setFilter,
    loading,
    error,
    refetch,
    markingAll,
    markAllRead,
    markOneRead,
  } = useNotifications({ enabled: Boolean(viewerUserId), isOpen, pageSize: 40 });

  const onMarkAll = async () => {
    await markAllRead();
    onAfterRead?.();
  };

  const onActivateRow = async (n: NotificationItem) => {
    await handleNotificationClick({
      notification: n,
      viewerUserId,
      navigate,
      currentLocation: location,
      markReadIfNeeded: markOneRead,
      onAfterRead,
      onClose: onRequestClose,
    });
  };

  return (
    <div className="flex max-h-[min(78vh,560px)] w-full flex-col overflow-hidden">
      <NotificationsList
        filter={filter}
        setFilter={setFilter}
        items={items}
        filteredItems={filteredItems}
        loading={loading}
        error={error}
        onRetry={() => void refetch()}
        markingAll={markingAll}
        onMarkAll={onMarkAll}
        viewerUserId={viewerUserId}
        onActivateRow={onActivateRow}
      />

      <div className="shrink-0 border-t border-[var(--woody-divider)] p-2">
        <Link
          to={signalsHref}
          onClick={() => onRequestClose()}
          className="flex items-start gap-2 rounded-xl px-2 py-2.5 text-sm transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
        >
          <Sparkles className="mt-0.5 size-4 shrink-0 text-[var(--woody-nav)]" aria-hidden />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="font-medium text-[var(--woody-text)]">Sinais recebidos</span>
            <span className="text-xs leading-snug text-[var(--woody-muted)]">
              {signalsUnreadCount > 0
                ? signalsUnreadCount === 1
                  ? "Tens 1 sinal por ler."
                  : `Tens ${signalsUnreadCount} sinais por ler.`
                : "Flertes e reações no teu perfil."}
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
}
