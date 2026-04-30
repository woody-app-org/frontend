import { AlertCircle, CheckCheck, Inbox, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "../services/notifications.service";
import { notificationSummaryFromItem } from "../lib/notificationCopy";
import { getNotificationTargetRoute } from "../lib/notificationNavigation";
import type { NotificationFilter } from "../hooks/useNotifications";
import { NotificationListItem } from "./NotificationListItem";

export interface NotificationsListProps {
  filter: NotificationFilter;
  setFilter: (f: NotificationFilter) => void;
  /** Lista completa (para saber se o vazio é do filtro). */
  items: NotificationItem[];
  filteredItems: NotificationItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  markingAll: boolean;
  onMarkAll: () => void | Promise<void>;
  viewerUserId: string;
  onActivateRow: (n: NotificationItem) => void | Promise<void>;
}

const filters: { id: NotificationFilter; label: string }[] = [
  { id: "all", label: "Tudo" },
  { id: "unread", label: "Não lidas" },
  { id: "comments", label: "Comentários" },
];

export function NotificationsList({
  filter,
  setFilter,
  items,
  filteredItems,
  loading,
  error,
  onRetry,
  markingAll,
  onMarkAll,
  viewerUserId,
  onActivateRow,
}: NotificationsListProps) {
  const hasAny = items.length > 0;
  const emptyBecauseFilter = hasAny && filteredItems.length === 0;
  const totallyEmpty = !hasAny && !loading && !error;

  return (
    <div className="flex max-h-[min(72vh,540px)] w-full flex-col overflow-hidden">
      <header className="shrink-0 space-y-2.5 border-b border-[var(--woody-divider)] px-3 pb-3 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold tracking-tight text-[var(--woody-text)]">Notificações</h2>
            <p className="truncate text-xs text-[var(--woody-muted)]">Atividade recente na Woody</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={markingAll || items.length === 0 || items.every((x) => x.readAt)}
            onClick={() => void onMarkAll()}
            className="shrink-0 gap-1 text-xs text-[var(--woody-muted)] hover:text-[var(--woody-text)]"
          >
            <CheckCheck className="size-3.5" aria-hidden />
            Marcar lidas
          </Button>
        </div>

        <div
          role="tablist"
          aria-label="Filtrar notificações"
          className="flex gap-1 rounded-xl bg-black/[0.04] p-1 dark:bg-white/[0.06]"
        >
          {filters.map((f) => {
            const selected = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "min-h-9 flex-1 rounded-lg px-2 text-xs font-medium transition-colors",
                  selected
                    ? "bg-[var(--woody-card)] text-[var(--woody-text)] shadow-sm ring-1 ring-black/[0.06] dark:ring-white/[0.08]"
                    : "text-[var(--woody-muted)] hover:text-[var(--woody-text)]"
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {loading ? (
          <div className="space-y-3 p-3" aria-busy="true" aria-label="A carregar notificações">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="size-11 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2 py-0.5">
                  <Skeleton className="h-4 w-[88%]" />
                  <Skeleton className="h-3 w-2/5" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!loading && error ? (
          <div className="m-3 flex flex-col items-center gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-8 text-center dark:border-amber-400/20 dark:bg-amber-400/[0.08]">
            <AlertCircle className="size-9 text-amber-700 dark:text-amber-200/90" aria-hidden />
            <p className="max-w-[18rem] text-sm text-amber-950/90 dark:text-amber-50/95">{error}</p>
            <Button type="button" variant="secondary" size="sm" className="gap-2" onClick={() => void onRetry()}>
              <RefreshCw className="size-3.5" aria-hidden />
              Tentar outra vez
            </Button>
          </div>
        ) : null}

        {!loading && !error && totallyEmpty ? (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <Inbox className="size-11 text-[var(--woody-muted)]" aria-hidden />
            <p className="text-sm font-medium text-[var(--woody-text)]">Nada por aqui ainda.</p>
            <p className="max-w-[17rem] text-xs leading-relaxed text-[var(--woody-muted)]">
              Quando alguém interagir contigo, aparece aqui.
            </p>
          </div>
        ) : null}

        {!loading && !error && emptyBecauseFilter ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <Inbox className="size-10 text-[var(--woody-muted)]" aria-hidden />
            <p className="text-sm font-medium text-[var(--woody-text)]">Sem resultados neste filtro</p>
            <p className="max-w-[16rem] text-xs text-[var(--woody-muted)]">Experimenta &quot;Tudo&quot; ou &quot;Não lidas&quot;.</p>
            <Button type="button" variant="outline" size="sm" onClick={() => setFilter("all")}>
              Ver tudo
            </Button>
          </div>
        ) : null}

        {!loading && !error && filteredItems.length > 0 ? (
          <ul className="divide-y divide-[var(--woody-divider)]">
            {filteredItems.map((n) => {
              const route = getNotificationTargetRoute(n, viewerUserId);
              const summary = notificationSummaryFromItem(n);
              return (
                <NotificationListItem
                  key={n.id}
                  item={n}
                  summary={summary}
                  hasDestination={Boolean(route)}
                  onActivate={() => void onActivateRow(n)}
                />
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
