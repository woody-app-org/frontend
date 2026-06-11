import { api, getApiErrorMessage } from "@/lib/api";
import type { AccountStatus, AdminUserAccountStatusResult } from "@/features/admin/reports/services/adminReports.service";

export interface AdminUserListItem {
  userId: number;
  username: string;
  displayName: string;
  email?: string | null;
  avatarUrl?: string | null;
  role?: string | null;
  accountStatus: AccountStatus;
  suspendedAt?: string | null;
  suspendedUntil?: string | null;
  suspensionReason?: string | null;
  bannedAt?: string | null;
  banReason?: string | null;
}

export interface AdminUserListResponse {
  items: AdminUserListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export async function listAdminUsers(params: { search?: string; page?: number; pageSize?: number } = {}): Promise<AdminUserListResponse> {
  const query: Record<string, unknown> = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
  };
  if (params.search) query.search = params.search;

  const { data } = await api.get<AdminUserListResponse>("/admin/users", { params: query });
  return data;
}

export function getBanUserErrorMessage(err: unknown): string {
  return getApiErrorMessage(err, "Não foi possível banir esta conta.");
}

export async function banUser(
  userId: number | string,
  payload: { reason: string; internalNote?: string }
): Promise<AdminUserAccountStatusResult> {
  try {
    const { data } = await api.post<AdminUserAccountStatusResult>(`/admin/users/${userId}/ban`, {
      reason: payload.reason.trim(),
      internalNote: payload.internalNote?.trim() || undefined,
    });
    return data;
  } catch (err) {
    throw new Error(getBanUserErrorMessage(err));
  }
}
