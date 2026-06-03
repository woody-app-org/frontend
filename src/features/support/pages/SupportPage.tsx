import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LifeBuoy, Loader2, AlertCircle, Plus, RefreshCw } from "lucide-react";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/features/feed/components/Pagination";
import { SupportTicketList } from "../components/SupportTicketList";
import {
  listMySupportTickets,
  type SupportTicketListItem,
} from "../services/support.service";
import {
  SUPPORT_STATUS_FILTER_OPTIONS,
  type SupportTicketStatus,
} from "../lib/supportHelpers";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

export function SupportPage() {
  const [items, setItems] = useState<SupportTicketListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [filterStatus, setFilterStatus] = useState<SupportTicketStatus | "">("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await listMySupportTickets({
        page,
        pageSize: PAGE_SIZE,
        status: filterStatus || undefined,
      });
      setItems(res.items);
      setTotalCount(res.totalCount);
      setHasNextPage(res.hasNextPage);
      setHasPreviousPage(res.hasPreviousPage);
    } catch {
      setError("Não foi possível carregar suas solicitações. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <FeedLayout showRightPanel={false}>
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8 space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[var(--woody-nav)]">
              <LifeBuoy className="size-6" aria-hidden />
              <h1 className="text-2xl font-bold text-[var(--woody-text)]">Suporte</h1>
            </div>
            <p className="text-sm text-[var(--woody-muted)] max-w-md">
              Envie uma solicitação para a equipe da Woody e acompanhe suas respostas.
            </p>
          </div>
          <Button asChild className="rounded-xl shrink-0">
            <Link to="/support/new">
              <Plus className="size-4 mr-1.5" aria-hidden />
              Nova solicitação
            </Link>
          </Button>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as SupportTicketStatus | "");
              setPage(1);
            }}
            className="rounded-xl border border-[var(--woody-accent)]/20 bg-white px-3 py-2 text-sm"
            aria-label="Filtrar por status"
          >
            {SUPPORT_STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void load()}
            disabled={isLoading}
            className="rounded-xl"
          >
            <RefreshCw className={cn("size-4", isLoading && "animate-spin")} aria-hidden />
            Atualizar
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16 text-[var(--woody-muted)]">
            <Loader2 className="size-8 animate-spin" aria-label="Carregando" />
          </div>
        ) : error ? (
          <div
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            {error}
          </div>
        ) : (
          <>
            <SupportTicketList items={items} />
            {totalCount > PAGE_SIZE ? (
              <Pagination
                page={page}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                onNext={() => setPage((p) => p + 1)}
                onPrevious={() => setPage((p) => Math.max(1, p - 1))}
              />
            ) : null}
          </>
        )}
      </div>
    </FeedLayout>
  );
}
