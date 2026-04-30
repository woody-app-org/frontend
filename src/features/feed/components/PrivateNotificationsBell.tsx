import { useCallback, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useProfileSignalsUnreadCount } from "@/features/profile/hooks/useProfileSignalsUnreadCount";
import { useNotificationsUnreadCount } from "@/features/notifications/hooks/useNotificationsUnreadCount";
import { useNotificationsInboxSignalR } from "@/features/notifications/hooks/useNotificationsInboxSignalR";
import { NotificationsPanel } from "@/features/notifications/components/NotificationsPanel";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { NotificationsPopoverContent } from "@/features/notifications/components/NotificationsPopover";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useMatchMedia } from "@/lib/useMatchMedia";
import { cn } from "@/lib/utils";

export interface PrivateNotificationsBellProps {
  variant: "toolbar" | "mobileHeader";
}

/**
 * Sino: notificações in-app (API) + atalho para sinais recebidos.
 * Desktop: popover junto ao ícone. Mobile: modal em cartão (área confortável para toque).
 */
export function PrivateNotificationsBell({ variant }: PrivateNotificationsBellProps) {
  const { pathname } = useLocation();
  const { isAuthenticated, user } = useAuth();
  const enabled = Boolean(isAuthenticated && user?.id);
  const isMessagesRoute = useMemo(() => /^\/messages(\/|$)/.test(pathname), [pathname]);
  /** Em /messages o `useDirectMessagesSignalR` já está no mesmo hub e grupo inbox. */
  useNotificationsInboxSignalR(enabled && !isMessagesRoute);
  const { unreadCount: signalsUnreadCount } = useProfileSignalsUnreadCount(enabled);
  const { unreadCount: notifUnread, refresh: refreshNotifUnread } = useNotificationsUnreadCount(enabled);
  const isMobile = useMatchMedia("(max-width: 767px)");
  const [open, setOpen] = useState(false);

  const signalsHref = user?.id ? `/profile/${user.id}?tab=signals` : "/feed";
  const hasSignalsUnread = signalsUnreadCount > 0;
  const label =
    notifUnread > 0
      ? notifUnread === 1
        ? "Notificações — 1 nova"
        : `Notificações — ${notifUnread} novas`
      : hasSignalsUnread
        ? signalsUnreadCount === 1
          ? "Notificações — 1 sinal novo"
          : `Notificações — ${signalsUnreadCount} sinais novos`
        : "Notificações";

  const onAfterRead = useCallback(() => {
    void refreshNotifUnread();
  }, [refreshNotifUnread]);

  const panel = user?.id ? (
    <NotificationsPanel
      isOpen={open}
      viewerUserId={user.id}
      signalsHref={signalsHref}
      signalsUnreadCount={signalsUnreadCount}
      onAfterRead={onAfterRead}
      onRequestClose={() => setOpen(false)}
    />
  ) : null;

  const toolbarGuest =
    "size-10 flex shrink-0 items-center justify-center rounded-full text-[var(--woody-text)] hover:bg-black/5";
  const mobileGuest =
    "size-10 flex shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10";

  if (!isAuthenticated || !user?.id) {
    return (
      <button type="button" className={cn(variant === "toolbar" ? toolbarGuest : mobileGuest)} aria-label="Notificações">
        <Bell className="size-5" aria-hidden />
      </button>
    );
  }

  if (isMobile) {
    return (
      <>
        <NotificationBell
          variant={variant}
          label={label}
          inAppUnreadCount={notifUnread}
          signalsUnread={hasSignalsUnread}
          aria-expanded={open}
          onClick={() => setOpen(true)}
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="fixed bottom-4 left-1/2 top-auto z-50 max-h-[min(88dvh,640px)] w-[calc(100vw-1rem)] max-w-[420px] -translate-x-1/2 translate-y-0 overflow-hidden rounded-2xl border-[var(--woody-divider)] bg-[var(--woody-card)] p-0 shadow-2xl ring-1 ring-black/[0.06] dark:ring-white/[0.08]">
            <DialogTitle className="sr-only">Notificações</DialogTitle>
            {panel}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <NotificationBell
          variant={variant}
          label={label}
          inAppUnreadCount={notifUnread}
          signalsUnread={hasSignalsUnread}
        />
      </PopoverTrigger>
      <NotificationsPopoverContent>{panel}</NotificationsPopoverContent>
    </Popover>
  );
}
