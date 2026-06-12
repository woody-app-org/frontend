import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Search,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  Loader2,
  Filter,
  X,
} from "lucide-react";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Pagination } from "@/features/feed/components/Pagination";
import { VerificationStatusBadge } from "../components/VerificationStatusBadge";
import {
  listVerificationRequests,
  type AdminVerificationListItemDto,
  type ListVerificationFilters,
} from "../services/adminVerification.service";
import { resolvePublicMediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { VerificationStatus } from "@/features/auth/types";
import { AdminNav } from "@/features/admin/components/AdminNav";

const STATUS_OPTIONS: { value: VerificationStatus | ""; label: string }[] = [
  { value: "", label: "Todos os status" },
  { value: "PendingDocument", label: "Aguarda documento" },
  { value: "PendingReview", label: "Em análise" },
  { value: "Approved", label: "Aprovadas" },
  { value: "Rejected", label: "Recusadas" },
];

const PAGE_SIZE = 20;

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getUserInitials(name: string | null | undefined, username: string): string {
  const display = name?.trim() || username;
  const parts = display.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return display.slice(0, 2).toUpperCase();
}

export function AdminVerificationListPage() {
  const [items, setItems] = useState<AdminVerificationListItemDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<VerificationStatus | "">("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const hasActiveFilters = Boolean(filterStatus || filterDateFrom || filterDateTo);

  const loadData = useCallback(
    async (targetPage: number, filters: ListVerificationFilters) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await listVerificationRequests({
          ...filters,
          page: targetPage,
          pageSize: PAGE_SIZE,
        });
        setItems(res.items);
        setTotalCount(res.totalCount);
        setHasNextPage(res.hasNextPage);
        setHasPreviousPage(res.hasPreviousPage);
      } catch {
        setError("Não foi possível carregar as solicitações. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadData(page, {
      status: filterStatus || undefined,
      dateFrom: filterDateFrom || undefined,
      dateTo: filterDateTo || undefined,
    });
  }, [page, filterStatus, filterDateFrom, filterDateTo, loadData]);

  const handleApplyFilters = useCallback(() => {
    if (page === 1) {
      void loadData(1, {
        status: filterStatus || undefined,
        dateFrom: filterDateFrom || undefined,
        dateTo: filterDateTo || undefined,
      });
    } else {
      setPage(1);
    }
  }, [page, filterStatus, filterDateFrom, filterDateTo, loadData]);

  const handleClearFilters = useCallback(() => {
    setFilterStatus("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setPage(1);
  }, []);

  const handleRefresh = useCallback(() => {
    void loadData(page, {
      status: filterStatus || undefined,
      dateFrom: filterDateFrom || undefined,
      dateTo: filterDateTo || undefined,
    });
  }, [page, filterStatus, filterDateFrom, filterDateTo, loadData]);

  return (
    <FeedLayout showRightPanel={false} wideMain>
      <AdminNav />
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--auth-button)]/15 text-[var(--auth-button-hover)]">
            <Shield className="size-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--woody-ink)]">
              Verificações de identidade
            </h1>
            <p className="text-sm text-[var(--woody-muted)]">
              {totalCount > 0 ? `${totalCount} solicitaç${totalCount === 1 ? "ão" : "ões"}` : "Dashboard SuperAdmin"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-black/15 bg-white px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("size-4", isLoading && "animate-spin")} aria-hidden />
          Atualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-4 rounded-xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          {/* Status */}
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</label>
            <div className="relative">
              <Filter className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" aria-hidden />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as VerificationStatus | "");
                  setPage(1);
                }}
                className="w-full appearance-none rounded-lg border border-black/15 bg-white py-2 pl-8 pr-3 text-sm text-[var(--woody-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--auth-button)]/35"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Data de */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              De
            </label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => { setFilterDateFrom(e.target.value); setPage(1); }}
              className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-[var(--woody-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--auth-button)]/35"
            />
          </div>

          {/* Data até */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              Até
            </label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => { setFilterDateTo(e.target.value); setPage(1); }}
              className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-[var(--woody-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--auth-button)]/35"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 self-end rounded-lg border border-black/12 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              <X className="size-3.5" aria-hidden />
              Limpar
            </button>
          )}

          <button
            type="button"
            onClick={handleApplyFilters}
            className="inline-flex items-center gap-1.5 self-end rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            <Search className="size-3.5" aria-hidden />
            Buscar
          </button>
        </div>
      </div>

      {/* Estado de erro */}
      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {error}
          <button
            type="button"
            onClick={handleRefresh}
            className="ml-auto text-red-600 underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Lista */}
      <div className="rounded-xl border border-black/10 bg-white shadow-sm overflow-visible">
        {isLoading && items.length === 0 ? (
          <div className="flex h-40 items-center justify-center gap-2 text-sm text-zinc-400">
            <Loader2 className="size-5 animate-spin" aria-hidden />
            Carregando…
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-1 text-sm text-zinc-400">
            <Shield className="size-8 text-zinc-300 mb-1" aria-hidden />
            Nenhuma solicitação encontrada.
          </div>
        ) : (
          <>
            {/* Desktop: tabela */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/8 bg-zinc-50/60">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                      Utilizadora
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                      Envio
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                      Tent.
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/6">
                  {items.map((item) => (
                    <tr
                      key={item.verificationId}
                      className={cn(
                        "transition-colors hover:bg-zinc-50/70",
                        isLoading && "opacity-50"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar size="sm">
                            {item.avatarUrl && (
                              <AvatarImage
                                src={resolvePublicMediaUrl(item.avatarUrl)}
                                alt={item.username}
                              />
                            )}
                            <AvatarFallback className="text-[10px] bg-[var(--auth-button)]/15 text-[var(--auth-button-hover)]">
                              {getUserInitials(item.displayName, item.username)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-[var(--woody-ink)]">
                              {item.displayName ?? item.username}
                            </p>
                            <p className="text-xs text-zinc-400">@{item.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">{item.email}</td>
                      <td className="px-4 py-3">
                        <VerificationStatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                        {formatDate(item.documentSubmittedAt)}
                      </td>
                      <td className="px-4 py-3 text-center text-zinc-500">
                        {item.attemptCount > 1 ? (
                          <span className="inline-flex size-5 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700">
                            {item.attemptCount}
                          </span>
                        ) : (
                          item.attemptCount
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/verification/${item.verificationId}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-black/15 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:border-black/25 transition-colors"
                        >
                          Ver detalhes
                          <ChevronRight className="size-3.5" aria-hidden />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: cards */}
            <div className="md:hidden divide-y divide-black/6">
              {items.map((item) => (
                <Link
                  key={item.verificationId}
                  to={`/admin/verification/${item.verificationId}`}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 hover:bg-zinc-50/70 transition-colors",
                    isLoading && "opacity-50"
                  )}
                >
                  <Avatar>
                    {item.avatarUrl && (
                      <AvatarImage
                        src={resolvePublicMediaUrl(item.avatarUrl)}
                        alt={item.username}
                      />
                    )}
                    <AvatarFallback className="text-xs bg-[var(--auth-button)]/15 text-[var(--auth-button-hover)]">
                      {getUserInitials(item.displayName, item.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-[var(--woody-ink)] truncate">
                        {item.displayName ?? item.username}
                      </p>
                      <VerificationStatusBadge status={item.status} />
                    </div>
                    <p className="text-xs text-zinc-400 truncate">
                      @{item.username} · {formatDate(item.documentSubmittedAt)}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-zinc-300 shrink-0" aria-hidden />
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Paginação */}
      {(hasNextPage || hasPreviousPage) && (
        <Pagination
          page={page}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          onNext={() => setPage((p) => p + 1)}
          onPrevious={() => setPage((p) => Math.max(1, p - 1))}
          className="mt-2"
        />
      )}
    </FeedLayout>
  );
}
