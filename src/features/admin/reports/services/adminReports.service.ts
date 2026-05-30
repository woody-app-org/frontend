import { api } from "@/lib/api";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type ReportStatus = "Pending" | "InReview" | "Resolved" | "Rejected";

export interface ReportUserPreview {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
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
