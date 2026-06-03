import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LifeBuoy,
  Search,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  Loader2,
  Filter,
  X,
} from "lucide-react";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import { Pagination } from "@/features/feed/components/Pagination";
import { AdminNav } from "@/features/admin/components/AdminNav";
import { SupportStatusBadge } from "@/features/support/components/SupportStatusBadge";
import {
  listAdminSupportTickets,
  type AdminSupportTicketListItem,
  type ListAdminSupportTicketsParams,
} from "../services/adminSupport.service";
import {
  SUPPORT_CATEGORY_OPTIONS,
  SUPPORT_STATUS_FILTER_OPTIONS,
  SUPPORT_PRIORITY_OPTIONS,
  categoryLabel,
  formatSupportDate,
  type SupportTicketCategory,
  type SupportTicketPriority,
  type SupportTicketStatus,
} from "@/features/support/lib/supportHelpers";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

export function AdminSupportListPage() {
  const [items, setItems] = useState<AdminSupportTicketListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<SupportTicketStatus | "">("");
  const [filterCategory, setFilterCategory] = useState<SupportTicketCategory | "">("");
  const [filterPriority, setFilterPriority] = useState<SupportTicketPriority | "">("");
  const [filterBanAppeal, setFilterBanAppeal] = useState<boolean | "">("");
  const [filterSearch, setFilterSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const hasActiveFilters = Boolean(
    filterStatus || filterCategory || filterPriority || filterBanAppeal !== "" || filterSearch
  );

  const loadData = useCallback(
    async (targetPage: number, filters: ListAdminSupportTicketsParams) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await listAdminSupportTickets({
          ...filters,
          page: targetPage,
          pageSize: PAGE_SIZE,
        });
        setItems(res.items);
        setTotalCount(res.totalCount);
        setHasNextPage(res.hasNextPage);
        setHasPreviousPage(res.hasPreviousPage);
      } catch {
        setError("Não foi possível carregar os tickets. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadData(page, {
      status: filterStatus || undefined,
      category: filterCategory || undefined,
      priority: filterPriority || undefined,
      isBanAppeal: filterBanAppeal === "" ? undefined : filterBanAppeal === true,
      search: filterSearch || undefined,
    });
  }, [page, filterStatus, filterCategory, filterPriority, filterBanAppeal, filterSearch, loadData]);

  const handleSearch = () => {
    setFilterSearch(searchInput.trim());
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilterStatus("");
    setFilterCategory("");
    setFilterPriority("");
    setFilterBanAppeal("");
    setFilterSearch("");
    setSearchInput("");
    setPage(1);
  };

  return (
    <FeedLayout showRightPanel={false} wideMain>
      <div className="px-4 py-6 sm:px-6 max-w-5xl mx-auto space-y-5">
        <AdminNav />

        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LifeBuoy className="size-6 text-[var(--auth-button-hover)]" aria-hidden />
            <h1 className="text-xl font-bold text-zinc-900">Suporte</h1>
          </div>
          <span className="text-sm text-zinc-500">{totalCount} solicitações</span>
        </header>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" aria-hidden />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Buscar título ou autora…"
              className="w-full rounded-lg border border-zinc-200 pl-9 pr-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
          >
            Buscar
          </button>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900"
            >
              <X className="size-3.5" aria-hidden />
              Limpar
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="size-4 text-zinc-400" aria-hidden />
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as SupportTicketStatus | "");
              setPage(1);
            }}
            className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
          >
            {SUPPORT_STATUS_FILTER_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value as SupportTicketCategory | "");
              setPage(1);
            }}
            className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
          >
            <option value="">Todas categorias</option>
            {SUPPORT_CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => {
              setFilterPriority(e.target.value as SupportTicketPriority | "");
              setPage(1);
            }}
            className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
          >
            <option value="">Todas prioridades</option>
            {SUPPORT_PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={filterBanAppeal === "" ? "" : filterBanAppeal ? "yes" : "no"}
            onChange={(e) => {
              const v = e.target.value;
              setFilterBanAppeal(v === "" ? "" : v === "yes");
              setPage(1);
            }}
            className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
          >
            <option value="">Apelo: todos</option>
            <option value="yes">Só apelo de ban</option>
            <option value="no">Sem apelo de ban</option>
          </select>
          <button
            type="button"
            onClick={() =>
              void loadData(page, {
                status: filterStatus || undefined,
                category: filterCategory || undefined,
                priority: filterPriority || undefined,
                isBanAppeal: filterBanAppeal === "" ? undefined : filterBanAppeal === true,
                search: filterSearch || undefined,
              })
            }
            disabled={isLoading}
            className="p-2 rounded-lg border border-zinc-200 hover:bg-zinc-50"
            aria-label="Atualizar"
          >
            <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-8 animate-spin text-zinc-400" aria-label="Carregando" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle className="size-4" aria-hidden />
            {error}
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-sm text-zinc-500 py-12">Nenhum ticket encontrado.</p>
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
            <ul className="divide-y divide-zinc-100">
              {items.map((ticket) => (
                <li key={ticket.publicId}>
                  <Link
                    to={`/admin/support/${ticket.publicId}`}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors",
                      ticket.isBanAppeal && "bg-amber-50/60 hover:bg-amber-50"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-zinc-900 truncate">{ticket.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {ticket.author?.displayName ?? ticket.author?.username ?? ticket.author?.emailMasked ?? "—"} ·{" "}
                        {categoryLabel(ticket.category)} · {formatSupportDate(ticket.createdAt)}
                      </p>
                    </div>
                    {ticket.isBanAppeal ? (
                      <span className="text-xs font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full ring-1 ring-amber-200 shrink-0">
                        Revisão de banimento
                      </span>
                    ) : null}
                    <SupportStatusBadge status={ticket.status} />
                    <span className="text-xs text-zinc-500 hidden sm:inline">
                      {ticket.priority}
                    </span>
                    <ChevronRight className="size-4 text-zinc-400 shrink-0" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {totalCount > PAGE_SIZE ? (
          <Pagination
            page={page}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onNext={() => setPage((p) => p + 1)}
            onPrevious={() => setPage((p) => Math.max(1, p - 1))}
          />
        ) : null}
      </div>
    </FeedLayout>
  );
}
