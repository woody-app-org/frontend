import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCheck, Inbox, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatRelativeTimeUtc } from "@/lib/formatRelativeTimeUtc";
import { getApiErrorMessage } from "@/lib/api";
import {
  fetchNotificationsPage,
  markAllNotificationsRead,
  markNotificationRead,
  notificationNavigationContext,
  type NotificationItem,
} from "../services/notifications.service";
import { notificationSummary } from "../lib/notificationCopy";
import { getNotificationHref } from "../lib/notificationNavigation";

export interface NotificationsPanelProps {
  viewerUserId: string;
  onAfterRead?: () => void;
  onRequestClose: () => void;
  /** Link rápido para sinais (perfil próprio). */
  signalsHref: string;
  signalsUnreadCount: number;
}

export function NotificationsPanel({
  viewerUserId,
  onAfterRead,
  onRequestClose,
  signalsHref,
  signalsUnreadCount,
}: NotificationsPanelProps) {
  const navigate = useNavigate();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await fetchNotificationsPage(1, 40);
      setItems(page.items);
    } catch (e) {
      setError(getApiErrorMessage(e, "Não foi possível carregar as notificações."));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onMarkAll = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
      onAfterRead?.();
    } catch (e) {
      setError(getApiErrorMessage(e, "Não foi possível marcar tudo como lido."));
    } finally {
      setMarkingAll(false);
    }
  };

  const onRowActivate = async (n: NotificationItem) => {
    const href = getNotificationHref(n.type, notificationNavigationContext(n), viewerUserId);
    if (!n.readAt) {
      try {
        await markNotificationRead(n.id);
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)));
        onAfterRead?.();
      } catch {
        /* navega mesmo assim */
      }
    }
    if (href) {
      navigate(href);
      onRequestClose();
    }
  };

  return (
    <div className="flex max-h-[min(70vh,520px)] w-full flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--woody-divider)] px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--woody-text)]">Notificações</p>
          <p className="truncate text-xs text-[var(--woody-muted)]">Atividade recente na Woody</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={markingAll || items.every((x) => x.readAt) || items.length === 0}
          onClick={() => void onMarkAll()}
          className="shrink-0 gap-1 text-xs text-[var(--woody-muted)] hover:text-[var(--woody-text)]"
        >
          <CheckCheck className="size-3.5" aria-hidden />
          Marcar lidas
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {loading ? (
          <div className="space-y-3 p-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-2.5">
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-[85%]" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!loading && error ? (
          <div className="p-4 text-center text-sm text-amber-800 dark:text-amber-200/95">{error}</div>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <Inbox className="size-10 text-[var(--woody-muted)]" aria-hidden />
            <p className="text-sm font-medium text-[var(--woody-text)]">Estás em dia</p>
            <p className="max-w-[16rem] text-xs leading-relaxed text-[var(--woody-muted)]">
              Quando houver curtidas, comentários ou pedidos, aparecem aqui.
            </p>
          </div>
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <ul className="divide-y divide-[var(--woody-divider)]">
            {items.map((n) => {
              const actor = n.actor;
              const name = actor?.displayName ?? "Alguém";
              const initials = name
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              const summary = notificationSummary(n.type, name);
              const unread = !n.readAt;
              const href = getNotificationHref(n.type, notificationNavigationContext(n), viewerUserId);

              return (
                <li key={n.id}>
                  <button
                    type="button"
                    disabled={!href}
                    onClick={() => void onRowActivate(n)}
                    className={cn(
                      "flex w-full items-start gap-2.5 px-3 py-3 text-left transition-colors",
                      "hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--woody-accent)]/25",
                      unread ? "bg-[var(--woody-nav)]/[0.06]" : "",
                      !href ? "cursor-default opacity-60" : "cursor-pointer"
                    )}
                  >
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage src={actor?.avatar ?? undefined} alt="" />
                      <AvatarFallback className="bg-[var(--woody-nav)]/12 text-xs font-medium text-[var(--woody-text)]">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-sm text-[var(--woody-text)]">{summary}</span>
                      <span className="mt-0.5 block text-xs tabular-nums text-[var(--woody-muted)]">
                        {formatRelativeTimeUtc(n.createdAt)}
                      </span>
                    </span>
                    {unread ? (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--woody-nav)]" aria-label="Não lida" />
                    ) : (
                      <span className="size-2 shrink-0" aria-hidden />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-[var(--woody-divider)] p-2">
        <Link
          to={signalsHref}
          onClick={() => onRequestClose()}
          className="flex items-start gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
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
