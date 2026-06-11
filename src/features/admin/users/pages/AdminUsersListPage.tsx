import { useState, useCallback, useEffect } from "react";
import { Users, Search, RefreshCw, Loader2, AlertCircle, Ban, ShieldOff, ShieldCheck } from "lucide-react";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Pagination } from "@/features/feed/components/Pagination";
import { AdminNav } from "@/features/admin/components/AdminNav";
import { SuspendUserDialog } from "@/features/admin/reports/components/SuspendUserDialog";
import { BanReportAuthorDialog } from "@/features/admin/reports/components/BanReportAuthorDialog";
import {
  suspendUser,
  reactivateUser,
  getReactivateUserErrorMessage,
  type ReportUserPreview,
} from "@/features/admin/reports/services/adminReports.service";
import { listAdminUsers, banUser, type AdminUserListItem } from "../services/adminUsers.service";
import { resolvePublicMediaUrl } from "@/lib/api";
import { formatDate, getUserInitials } from "@/features/admin/reports/utils/reportHelpers";
import { showSuccessToast, showErrorToast } from "@/lib/toast/woodyToast";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

function toPreview(user: AdminUserListItem): ReportUserPreview {
  return {
    id: String(user.userId),
    name: user.displayName,
    username: user.username,
    avatarUrl: user.avatarUrl,
    accountStatus: user.accountStatus,
    suspendedUntil: user.suspendedUntil,
  };
}

function AccountStatusBadge({ status }: { status: AdminUserListItem["accountStatus"] }) {
  if (status === "Banned") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
        Banida
      </span>
    );
  }
  if (status === "Suspended") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
        Suspensa
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
      Ativa
    </span>
  );
}

export function AdminUsersListPage() {
  const [items, setItems] = useState<AdminUserListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterSearch, setFilterSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [suspendTarget, setSuspendTarget] = useState<AdminUserListItem | null>(null);
  const [banTarget, setBanTarget] = useState<AdminUserListItem | null>(null);
  const [actioningUserId, setActioningUserId] = useState<number | null>(null);

  const loadData = useCallback(async (targetPage: number, search: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await listAdminUsers({ search: search || undefined, page: targetPage, pageSize: PAGE_SIZE });
      setItems(res.items);
      setTotalCount(res.totalCount);
      setHasNextPage(res.hasNextPage);
      setHasPreviousPage(res.hasPreviousPage);
    } catch {
      setError("Não foi possível carregar as usuárias. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData(page, filterSearch);
  }, [page, filterSearch, loadData]);

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

  const handleRefresh = useCallback(() => {
    void loadData(page, filterSearch);
  }, [page, filterSearch, loadData]);

  const handleSuspendConfirm = useCallback(
    async (payload: { reason: string; durationHours: number }) => {
      if (!suspendTarget) return;
      await suspendUser(suspendTarget.userId, payload);
      showSuccessToast("Conta suspensa com sucesso.");
      setSuspendTarget(null);
      void loadData(page, filterSearch);
    },
    [suspendTarget, page, filterSearch, loadData]
  );

  const handleBanConfirm = useCallback(
    async (payload: { reason: string; internalNote?: string }) => {
      if (!banTarget) return;
      await banUser(banTarget.userId, payload);
      showSuccessToast("Conta banida com sucesso.");
      setBanTarget(null);
      void loadData(page, filterSearch);
    },
    [banTarget, page, filterSearch, loadData]
  );

  const handleReactivate = useCallback(
    async (user: AdminUserListItem) => {
      setActioningUserId(user.userId);
      try {
        await reactivateUser(user.userId);
        showSuccessToast("Conta reativada com sucesso.");
        void loadData(page, filterSearch);
      } catch (e) {
        showErrorToast(getReactivateUserErrorMessage(e));
      } finally {
        setActioningUserId(null);
      }
    },
    [page, filterSearch, loadData]
  );

  return (
    <FeedLayout showRightPanel={false} wideMain>
      <AdminNav />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
            <Users className="size-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--woody-ink)]">Usuárias</h1>
            <p className="text-sm text-[var(--woody-muted)]">
              {totalCount > 0
                ? `${totalCount} usuária${totalCount === 1 ? "" : "s"}`
                : "Liste, suspenda ou bana contas da plataforma."}
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

      {/* Busca */}
      <div className="mb-4 rounded-xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
            Buscar por nome, @ ou e-mail
          </label>
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" aria-hidden />
              <input
                type="text"
                placeholder="Nome, @username ou e-mail"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full rounded-lg border border-black/15 bg-white py-2 pl-8 pr-3 text-sm text-[var(--woody-ink)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--auth-button)]/35"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="inline-flex items-center gap-1.5 rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              <Search className="size-3.5" aria-hidden />
              Buscar
            </button>
          </div>
        </div>
      </div>

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

      <div className="rounded-xl border border-black/10 bg-white shadow-sm overflow-visible">
        {isLoading && items.length === 0 ? (
          <div className="flex h-40 items-center justify-center gap-2 text-sm text-zinc-400">
            <Loader2 className="size-5 animate-spin" aria-hidden />
            Carregando…
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-1 text-sm text-zinc-400">
            <Users className="size-8 text-zinc-300 mb-1" aria-hidden />
            Nenhuma usuária encontrada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/8 bg-zinc-50/60">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Usuária
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    E-mail
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Função
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Desde
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/6">
                {items.map((user) => {
                  const isSuperAdmin = user.role === "SuperAdmin";
                  const isBanned = user.accountStatus === "Banned";
                  const isSuspended = user.accountStatus === "Suspended";
                  const isActioning = actioningUserId === user.userId;

                  return (
                    <tr key={user.userId} className="transition-colors hover:bg-zinc-50/70">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar size="sm">
                            {user.avatarUrl && (
                              <AvatarImage src={resolvePublicMediaUrl(user.avatarUrl)} alt={user.username} />
                            )}
                            <AvatarFallback className="text-[10px] bg-[var(--auth-button)]/15 text-[var(--auth-button-hover)]">
                              {getUserInitials(user.displayName, user.username)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-[var(--woody-ink)] text-xs leading-tight">
                              {user.displayName}
                            </p>
                            <p className="text-[11px] text-zinc-400">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-500 text-xs">{user.email ?? "—"}</td>
                      <td className="px-4 py-3 text-zinc-500 text-xs">{user.role ?? "User"}</td>
                      <td className="px-4 py-3">
                        <AccountStatusBadge status={user.accountStatus} />
                        {isSuspended && user.suspendedUntil && (
                          <p className="mt-0.5 text-[10px] text-zinc-400">
                            até {formatDate(user.suspendedUntil)}
                          </p>
                        )}
                        {isBanned && user.banReason && (
                          <p className="mt-0.5 text-[10px] text-zinc-400 max-w-[160px] truncate" title={user.banReason}>
                            {user.banReason}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-zinc-500 whitespace-nowrap text-xs">—</td>
                      <td className="px-4 py-3">
                        {isSuperAdmin ? (
                          <span className="block text-right text-[11px] text-zinc-400">—</span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            {isSuspended ? (
                              <button
                                type="button"
                                onClick={() => void handleReactivate(user)}
                                disabled={isActioning}
                                className="inline-flex items-center gap-1 rounded-lg border border-black/15 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:border-black/25 transition-colors disabled:opacity-50"
                              >
                                {isActioning ? (
                                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                                ) : (
                                  <ShieldCheck className="size-3.5" aria-hidden />
                                )}
                                Reativar
                              </button>
                            ) : (
                              !isBanned && (
                                <button
                                  type="button"
                                  onClick={() => setSuspendTarget(user)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-black/15 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:border-black/25 transition-colors"
                                >
                                  <ShieldOff className="size-3.5" aria-hidden />
                                  Suspender
                                </button>
                              )
                            )}
                            {!isBanned && (
                              <button
                                type="button"
                                onClick={() => setBanTarget(user)}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
                              >
                                <Ban className="size-3.5" aria-hidden />
                                Banir
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

      {suspendTarget && (
        <SuspendUserDialog
          open={Boolean(suspendTarget)}
          onOpenChange={(open) => !open && setSuspendTarget(null)}
          author={toPreview(suspendTarget)}
          onConfirm={handleSuspendConfirm}
        />
      )}

      {banTarget && (
        <BanReportAuthorDialog
          open={Boolean(banTarget)}
          onOpenChange={(open) => !open && setBanTarget(null)}
          author={toPreview(banTarget)}
          onConfirm={handleBanConfirm}
        />
      )}
    </FeedLayout>
  );
}
