import axios from "axios";
import { api, getApiErrorMessage } from "@/lib/api";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type ReportStatus = "Pending" | "InReview" | "Resolved" | "Rejected";

export type AccountStatus = "Active" | "Banned" | "Suspended";

export interface ReportUserPreview {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  /** Preenchido pelo backend em contextos administrativos. */
  accountStatus?: AccountStatus | null;
  /** Preenchido quando accountStatus === "Suspended". */
  suspendedUntil?: string | null;
}

export interface ReportTargetPreview {
  postId?: number | null;
  commentId?: number | null;
  contentSnippet?: string | null;
}

export interface AdminReportListItem {
  id: number;
  targetType: string;
  reasonCode: string;
  status: ReportStatus;
  reporterUser: ReportUserPreview;
  reportedContentAuthor?: ReportUserPreview | null;
  targetPreview: ReportTargetPreview;
  sameTargetReportCount: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface AdminReportMediaItem {
  kind: string;
  url: string;
}

export interface AdminReportPostDetail {
  id: number;
  publicId: string;
  content: string;
  isDeleted: boolean;
  createdAt: string;
  media: AdminReportMediaItem[];
}

export interface AdminReportCommentDetail {
  id: number;
  content: string;
  isDeleted: boolean;
  createdAt: string;
  parentPost?: AdminReportPostDetail | null;
}

export interface AdminReportReviewer {
  id: number;
  username: string;
  displayName?: string | null;
}

export interface AdminReportDetail {
  id: number;
  targetType: string;
  reasonCode: string;
  details?: string | null;
  status: ReportStatus;
  internalNote?: string | null;
  resolutionCode?: string | null;
  reporterUser: ReportUserPreview;
  reportedContentAuthor?: ReportUserPreview | null;
  reviewedBy?: AdminReportReviewer | null;
  post?: AdminReportPostDetail | null;
  comment?: AdminReportCommentDetail | null;
  sameTargetReportCount: number;
  createdAt: string;
  updatedAt?: string | null;
  reviewedAt?: string | null;
}

export interface AdminReportListResponse {
  items: AdminReportListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ListAdminReportsParams {
  page?: number;
  pageSize?: number;
  status?: ReportStatus | "";
  targetType?: string;
  reasonCode?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface UpdateReportStatusPayload {
  status: ReportStatus;
  /** String vazia limpa a nota existente; undefined não envia o campo (sem alteração). */
  internalNote?: string;
  resolutionCode?: string;
}

export interface BanReportAuthorPayload {
  reason: string;
  internalNote?: string;
}

export interface BanReportAuthorResult {
  userId: number;
  username: string;
  displayName: string;
  accountStatus: AccountStatus;
  bannedAt?: string | null;
}

export const BAN_REASON_MIN_LENGTH = 10;
export const BAN_REASON_MAX_LENGTH = 500;

export interface SuspendUserPayload {
  reason: string;
  durationHours: number;
}

export interface AdminUserAccountStatusResult {
  userId: number;
  username: string;
  displayName: string;
  accountStatus: AccountStatus;
  suspendedAt?: string | null;
  suspendedUntil?: string | null;
  suspensionReason?: string | null;
}

export const SUSPENSION_REASON_MIN_LENGTH = 10;
export const SUSPENSION_REASON_MAX_LENGTH = 500;

/** Opções de duração pré-definidas para a suspensão temporária. */
export const SUSPENSION_DURATION_OPTIONS: { label: string; hours: number }[] = [
  { label: "24 horas", hours: 24 },
  { label: "3 dias", hours: 24 * 3 },
  { label: "7 dias", hours: 24 * 7 },
  { label: "15 dias", hours: 24 * 15 },
  { label: "30 dias", hours: 24 * 30 },
];

// ─── Service functions ────────────────────────────────────────────────────────

export async function listAdminReports(
  params: ListAdminReportsParams = {}
): Promise<AdminReportListResponse> {
  const query: Record<string, unknown> = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
  };
  if (params.status) query.status = params.status;
  if (params.targetType) query.targetType = params.targetType;
  if (params.reasonCode) query.reasonCode = params.reasonCode;
  if (params.search) query.search = params.search;
  if (params.dateFrom) query.dateFrom = params.dateFrom;
  if (params.dateTo) query.dateTo = params.dateTo;

  const { data } = await api.get<AdminReportListResponse>("/admin/reports", { params: query });
  return data;
}

export async function getAdminReportDetail(reportId: number): Promise<AdminReportDetail> {
  const { data } = await api.get<AdminReportDetail>(`/admin/reports/${reportId}`);
  return data;
}

export async function updateAdminReportStatus(
  reportId: number,
  payload: UpdateReportStatusPayload
): Promise<AdminReportDetail> {
  const { data } = await api.patch<AdminReportDetail>(
    `/admin/reports/${reportId}/status`,
    payload
  );
  return data;
}

export function isReportUserBanned(user: ReportUserPreview | null | undefined): boolean {
  return user?.accountStatus === "Banned";
}

export function isReportUserSuspended(user: ReportUserPreview | null | undefined): boolean {
  return user?.accountStatus === "Suspended";
}

export function getBanReportAuthorErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { code?: string; error?: string } | undefined;
    if (
      data?.code === "CANNOT_BAN_SELF" ||
      data?.code === "CANNOT_BAN_SUPERADMIN"
    ) {
      return "Esta conta não pode ser banida por esta ação.";
    }
    if (err.response?.status === 403) {
      return "Você não tem permissão para realizar esta ação.";
    }
  }
  return getApiErrorMessage(err, "Não foi possível banir esta conta.");
}

export async function banReportAuthor(
  reportId: number,
  payload: BanReportAuthorPayload
): Promise<BanReportAuthorResult> {
  try {
    const { data } = await api.post<BanReportAuthorResult>(
      `/admin/reports/${reportId}/ban-author`,
      {
        reason: payload.reason.trim(),
        internalNote: payload.internalNote?.trim() || undefined,
      }
    );
    return data;
  } catch (err) {
    throw new Error(getBanReportAuthorErrorMessage(err));
  }
}

export function getSuspendUserErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { code?: string; error?: string } | undefined;
    if (
      data?.code === "CANNOT_SUSPEND_SELF" ||
      data?.code === "CANNOT_SUSPEND_SUPERADMIN"
    ) {
      return "Esta conta não pode ser suspensa por esta ação.";
    }
    if (data?.code === "ACCOUNT_IS_BANNED") {
      return "Esta conta está banida e não pode ser suspensa.";
    }
    if (err.response?.status === 403) {
      return "Você não tem permissão para realizar esta ação.";
    }
  }
  return getApiErrorMessage(err, "Não foi possível suspender esta conta.");
}

export function getReactivateUserErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { code?: string; error?: string } | undefined;
    if (data?.code === "ACCOUNT_IS_BANNED") {
      return "Esta conta está banida. Reverta o banimento primeiro.";
    }
    if (err.response?.status === 403) {
      return "Você não tem permissão para realizar esta ação.";
    }
  }
  return getApiErrorMessage(err, "Não foi possível reativar esta conta.");
}

export async function suspendUser(
  userId: number | string,
  payload: SuspendUserPayload
): Promise<AdminUserAccountStatusResult> {
  try {
    const { data } = await api.post<AdminUserAccountStatusResult>(
      `/admin/users/${userId}/suspend`,
      {
        reason: payload.reason.trim(),
        durationHours: payload.durationHours,
      }
    );
    return data;
  } catch (err) {
    throw new Error(getSuspendUserErrorMessage(err));
  }
}

export async function reactivateUser(
  userId: number | string
): Promise<AdminUserAccountStatusResult> {
  try {
    const { data } = await api.post<AdminUserAccountStatusResult>(
      `/admin/users/${userId}/reactivate`
    );
    return data;
  } catch (err) {
    throw new Error(getReactivateUserErrorMessage(err));
  }
}
