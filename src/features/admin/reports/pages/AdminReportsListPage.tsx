import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Flag,
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
import { AdminNav } from "@/features/admin/components/AdminNav";
import { ReportStatusBadge } from "../components/ReportStatusBadge";
import {
  listAdminReports,
  type AdminReportListItem,
  type ListAdminReportsParams,
  type ReportStatus,
} from "../services/adminReports.service";
import { resolvePublicMediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  formatDate,
  getUserInitials,
  targetTypeLabel,
  reasonLabel,
} from "../utils/reportHelpers";

const STATUS_OPTIONS: { value: ReportStatus | ""; label: string }[] = [
  { value: "", label: "Todos os status" },
  { value: "Pending", label: "Pendente" },
  { value: "InReview", label: "Em análise" },
  { value: "Resolved", label: "Resolvida" },
  { value: "Rejected", label: "Improcedente" },
];

const TARGET_OPTIONS = [
  { value: "", label: "Todos os tipos" },
  { value: "post", label: "Post" },
  { value: "comment", label: "Comentário" },
];

const PAGE_SIZE = 20;

export function AdminReportsListPage() {
  const [items, setItems] = useState<AdminReportListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<ReportStatus | "">("");
  const [filterTargetType, setFilterTargetType] = useState("");
  const [filterReasonCode, setFilterReasonCode] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const hasActiveFilters = Boolean(
    filterStatus || filterTargetType || filterReasonCode || filterSearch
  );

  const loadData = useCallback(
    async (targetPage: number, filters: ListAdminReportsParams) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await listAdminReports({
          ...filters,
          page: targetPage,
          pageSize: PAGE_SIZE,
        });
        setItems(res.items);
        setTotalCount(res.totalCount);
        setHasNextPage(res.hasNextPage);
        setHasPreviousPage(res.hasPreviousPage);
      } catch {
        setError("Não foi possível carregar as denúncias. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadData(page, {
      status: filterStatus || undefined,
      targetType: filterTargetType || undefined,
      reasonCode: filterReasonCode || undefined,
      search: filterSearch || undefined,
    });
  }, [page, filterStatus, filterTargetType, filterReasonCode, filterSearch, loadData]);

  const handleSearch = useCallback(() => {
    setFilterSearch(searchInput.trim());
    setPage(1);
  }, [searchInput]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch]
  );

  const handleClearFilters = useCallback(() => {
    setFilterStatus("");
    setFilterTargetType("");
    setFilterReasonCode("");
    setFilterSearch("");
    setSearchInput("");
    setPage(1);
  }, []);

  const handleRefresh = useCallback(() => {
    void loadData(page, {
      status: filterStatus || undefined,
      targetType: filterTargetType || undefined,
      reasonCode: filterReasonCode || undefined,
      search: filterSearch || undefined,
    });
  }, [page, filterStatus, filterTargetType, filterReasonCode, filterSearch, loadData]);

  return (
    <FeedLayout showRightPanel={false} wideMain>
      <AdminNav />

      {/* Cabeçalho */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
            <Flag className="size-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--woody-ink)]">Denúncias</h1>
            <p className="text-sm text-[var(--woody-muted)]">
              {totalCount > 0
                ? `${totalCount} denúncia${totalCount === 1 ? "" : "s"}`
                : "Acompanhe denúncias enviadas pela comunidade e registre decisões internas."}
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
          <div className="flex flex-col gap-1 min-w-[150px]">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              Status
            </label>
            <div className="relative">
              <Filter className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" aria-hidden />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as ReportStatus | "");
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

          {/* Tipo */}
          <div className="flex flex-col gap-1 min-w-[140px]">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              Tipo
            </label>
            <select
              value={filterTargetType}
              onChange={(e) => {
                setFilterTargetType(e.target.value);
                setPage(1);
              }}
              className="w-full appearance-none rounded-lg border border-black/15 bg-white py-2 px-3 text-sm text-[var(--woody-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--auth-button)]/35"
            >
              {TARGET_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Motivo */}
          <div className="flex flex-col gap-1 min-w-[140px]">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              Motivo
            </label>
            <input
              type="text"
              placeholder="ex: spam"
              value={filterReasonCode}
              onChange={(e) => {
                setFilterReasonCode(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-[var(--woody-ink)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--auth-button)]/35"
            />
          </div>

          {/* Busca */}
          <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              Buscar por nome ou @
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" aria-hidden />
              <input
                type="text"
                placeholder="Nome ou @username"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full rounded-lg border border-black/15 bg-white py-2 pl-8 pr-3 text-sm text-[var(--woody-ink)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--auth-button)]/35"
              />
            </div>
          </div>

          <div className="flex items-end gap-2 self-end">
            <button
              type="button"
              onClick={handleSearch}
              className="inline-flex items-center gap-1.5 rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              <Search className="size-3.5" aria-hidden />
              Buscar
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 rounded-lg border border-black/12 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                <X className="size-3.5" aria-hidden />
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Erro */}
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
      <div className="rounded-xl border border-black/10 bg-white shadow-sm overflow-hidden">
        {isLoading && items.length === 0 ? (
          <div className="flex h-40 items-center justify-center gap-2 text-sm text-zinc-400">
            <Loader2 className="size-5 animate-spin" aria-hidden />
            Carregando…
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-1 text-sm text-zinc-400">
            <Flag className="size-8 text-zinc-300 mb-1" aria-hidden />
            Nenhuma denúncia encontrada.
          </div>
        ) : (
          <>
            {/* Desktop: tabela */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/8 bg-zinc-50/60">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                      Tipo / Motivo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                      Denunciante
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                      Autora do conteúdo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                      Data
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                      Mesmo alvo
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/6">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className={cn(
                        "transition-colors hover:bg-zinc-50/70",
                        isLoading && "opacity-50"
                      )}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-[var(--woody-ink)]">
                          {targetTypeLabel(item.targetType)}
                        </p>
                        <p className="text-xs text-zinc-400">{reasonLabel(item.reasonCode)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <UserCell user={item.reporterUser} />
                      </td>
                      <td className="px-4 py-3">
                        {item.reportedContentAuthor ? (
                          <UserCell user={item.reportedContentAuthor} />
                        ) : (
                          <span className="text-zinc-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <ReportStatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 text-zinc-500 whitespace-nowrap text-xs">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.sameTargetReportCount > 1 ? (
                          <span className="inline-flex size-6 items-center justify-center rounded-full bg-red-100 text-xs font-semibold text-red-700">
                            {item.sameTargetReportCount}
                          </span>
                        ) : (
                          <span className="text-zinc-400 text-xs">1</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/reports/${item.id}`}
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
                  key={item.id}
                  to={`/admin/reports/${item.id}`}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 hover:bg-zinc-50/70 transition-colors",
                    isLoading && "opacity-50"
                  )}
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                    <Flag className="size-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-[var(--woody-ink)] text-sm">
                        {targetTypeLabel(item.targetType)} · {reasonLabel(item.reasonCode)}
                      </p>
                      <ReportStatusBadge status={item.status} />
                    </div>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      @{item.reporterUser.username} · {formatDate(item.createdAt)}
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

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function UserCell({ user }: { user: { username: string; name: string; avatarUrl?: string | null } }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar size="sm">
        {user.avatarUrl && (
          <AvatarImage src={resolvePublicMediaUrl(user.avatarUrl)} alt={user.username} />
        )}
        <AvatarFallback className="text-[10px] bg-[var(--auth-button)]/15 text-[var(--auth-button-hover)]">
          {getUserInitials(user.name, user.username)}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium text-[var(--woody-ink)] text-xs leading-tight">{user.name}</p>
        <p className="text-[11px] text-zinc-400">@{user.username}</p>
      </div>
    </div>
  );
}
