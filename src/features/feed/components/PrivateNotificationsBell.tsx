import { useCallback, useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useProfileSignalsUnreadCount } from "@/features/profile/hooks/useProfileSignalsUnreadCount";
import { useNotificationsUnreadCount } from "@/features/notifications/hooks/useNotificationsUnreadCount";
import { NotificationsPanel } from "@/features/notifications/components/NotificationsPanel";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useMatchMedia } from "@/lib/useMatchMedia";
import { cn } from "@/lib/utils";

const bellWrap = "relative";
export interface PrivateNotificationsBellProps {
  variant: "toolbar" | "mobileHeader";
}

/**
 * Sino: notificações in-app (API) + atalho para sinais recebidos.
 * Desktop: popover junto ao ícone. Mobile: modal tipo sheet (altura limitada).
 */
export function PrivateNotificationsBell({ variant }: PrivateNotificationsBellProps) {
  const { isAuthenticated, user } = useAuth();
  const enabled = Boolean(isAuthenticated && user?.id);
  const { unreadCount: signalsUnread } = useProfileSignalsUnreadCount(enabled);
  const { unreadCount: notifUnread, refresh: refreshNotifUnread } = useNotificationsUnreadCount(enabled);
  const isMobile = useMatchMedia("(max-width: 767px)");
  const [open, setOpen] = useState(false);

  const toolbarBtn =
    "size-10 flex items-center justify-center rounded-full text-[var(--woody-text)] hover:bg-black/5 transition-colors shrink-0";
  const mobileBtn =
    "size-10 flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors shrink-0";

  const signalsHref = user?.id ? `/profile/${user.id}?tab=signals` : "/feed";
  const hasUnread = notifUnread > 0 || signalsUnread > 0;
  const badgeLabel =
    notifUnread > 0
      ? notifUnread > 99
        ? "99+"
        : String(notifUnread)
      : signalsUnread > 0
        ? "•"
        : null;

  const onAfterRead = useCallback(() => {
    void refreshNotifUnread();
  }, [refreshNotifUnread]);

  const label =
    notifUnread > 0
      ? notifUnread === 1
        ? "Notificações — 1 nova"
        : `Notificações — ${notifUnread} novas`
      : signalsUnread > 0
        ? signalsUnread === 1
          ? "Notificações — 1 sinal novo"
          : `Notificações — ${signalsUnread} sinais novos`
        : "Notificações";

  if (!isAuthenticated || !user?.id) {
    return (
      <button type="button" className={cn(variant === "toolbar" ? toolbarBtn : mobileBtn, bellWrap)} aria-label="Notificações">
        <Bell className="size-5" />
      </button>
    );
  }

  const bellIcon = (
    <>
      <Bell className="size-5" />
      {hasUnread && badgeLabel ? (
        <span
          className={cn(
            "pointer-events-none absolute -right-0.5 -top-0.5 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--woody-nav)] px-1 text-[0.65rem] font-semibold leading-none text-white ring-2",
            variant === "toolbar" ? "ring-[var(--woody-main-surface)]" : "ring-[var(--woody-sidebar)]"
          )}
          aria-hidden
        >
          {badgeLabel}
        </span>
      ) : null}
    </>
  );

  const panel = (
    <NotificationsPanel
      viewerUserId={user.id}
      signalsHref={signalsHref}
      signalsUnreadCount={signalsUnread}
      onAfterRead={onAfterRead}
      onRequestClose={() => setOpen(false)}
    />
  );

  if (isMobile) {
    return (
      <>
        <button
          type="button"
          className={cn(variant === "toolbar" ? toolbarBtn : mobileBtn, bellWrap)}
          aria-label={label}
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          {bellIcon}
        </button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            className="fixed bottom-4 left-1/2 top-auto z-50 max-h-[min(88dvh,640px)] w-[calc(100vw-1rem)] max-w-[420px] -translate-x-1/2 translate-y-0 overflow-hidden rounded-2xl border-[var(--woody-divider)] bg-[var(--woody-card)] p-0 shadow-xl"
          >
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
        <button type="button" className={cn(variant === "toolbar" ? toolbarBtn : mobileBtn, bellWrap)} aria-label={label}>
          {bellIcon}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" side="bottom" sideOffset={8} className="w-[min(calc(100vw-1.5rem),400px)] p-0">
        {panel}
      </PopoverContent>
    </Popover>
  );
}
